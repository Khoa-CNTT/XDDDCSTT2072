package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.FeedbackDTO;
import com.agricultural.agricultural.entity.Feedback;
import com.agricultural.agricultural.entity.FeedbackImage;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.FeedbackStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.IFeedbackRepository;
import com.agricultural.agricultural.repository.IFeedbackImageRepository;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.service.IFeedbackService;
import com.agricultural.agricultural.service.ICloudinaryService;
import com.agricultural.agricultural.mapper.FeedbackMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackServiceImpl implements IFeedbackService {

    private final IFeedbackRepository feedbackRepository;
    private final IFeedbackImageRepository feedbackImageRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final FeedbackMapper feedbackMapper;
    private final ICloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper;
    
    // Định nghĩa đường dẫn lưu ảnh feedback trên Cloudinary
    private static final String FEEDBACK_IMAGE_PATH = "feedback-images";

    /**
     * Lấy thông tin người dùng hiện tại từ SecurityContext
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new BadRequestException("Không thể xác thực thông tin người dùng");
        }
        
        return (User) principal;
    }

    @Override
    @Transactional
    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO, List<MultipartFile> images) {
        User currentUser = getCurrentUser();
        
        // Kiểm tra sự tồn tại của sản phẩm
        MarketPlace product = marketPlaceRepository.findById(feedbackDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + feedbackDTO.getProductId()));
        
        // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        Optional<Feedback> existingFeedback = feedbackRepository.findByUserIdAndProductId(currentUser.getId(), feedbackDTO.getProductId());
        if (existingFeedback.isPresent()) {
            throw new BadRequestException("Bạn đã đánh giá sản phẩm này rồi");
        }
        
        // TODO: Kiểm tra xem người dùng đã mua sản phẩm này chưa (có thể thêm sau)
        
        // Tạo đánh giá mới
        Feedback feedback = Feedback.builder()
                .userId(currentUser.getId())
                .productId(feedbackDTO.getProductId())
                .rating(feedbackDTO.getRating())
                .comment(feedbackDTO.getComment())
                .reviewDate(LocalDateTime.now())
                .status("PENDING") // Đánh giá mới sẽ ở trạng thái chờ duyệt
                .isVerifiedPurchase(false) // TODO: cập nhật lại sau khi kiểm tra mua hàng
                .helpfulCount(0)
                .notHelpfulCount(0)
                .build();
        
        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        // Xử lý ảnh đánh giá nếu có
        if (images != null && !images.isEmpty()) {
            processImages(savedFeedback, images);
        }
        
        return mapToDTO(savedFeedback);
    }

    @Override
    @Transactional
    public FeedbackDTO updateFeedback(Integer id, FeedbackDTO feedbackDTO, List<MultipartFile> images) {
        User currentUser = getCurrentUser();
        
        // Kiểm tra sự tồn tại của đánh giá
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        // Kiểm tra quyền chỉnh sửa
        if (!Objects.equals(feedback.getUserId(), currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa đánh giá này");
        }
        
        // Cập nhật thông tin
        feedback.setRating(feedbackDTO.getRating());
        feedback.setComment(feedbackDTO.getComment());
        
        // Luôn gán status là PENDING khi cập nhật 
        feedback.setStatus("PENDING");
        
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        
        // Xử lý ảnh đánh giá nếu có
        if (images != null && !images.isEmpty()) {
            // Xóa ảnh cũ trên Cloudinary và trong database
            List<FeedbackImage> oldImages = feedbackImageRepository.findByFeedbackIdOrderByDisplayOrderAsc(id);
            for (FeedbackImage oldImage : oldImages) {
                try {
                    // Trích xuất public ID từ URL để xóa ảnh trên Cloudinary
                    String publicId = extractPublicIdFromUrl(oldImage.getImageUrl());
                    if (publicId != null) {
                        cloudinaryService.deleteImage(publicId);
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi xóa ảnh cũ trên Cloudinary: {}", e.getMessage());
                }
            }
            
            // Xóa tất cả ảnh cũ trong database
            feedbackImageRepository.deleteByFeedbackId(updatedFeedback.getId());
            
            // Thêm ảnh mới
            processImages(updatedFeedback, images);
        }
        
        return mapToDTO(updatedFeedback);
    }

    /**
     * Trích xuất public ID từ Cloudinary URL
     */
    private String extractPublicIdFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // URL dạng: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[file_name].[extension]
            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length < 2) return null;
            
            String path = parts[1];
            // Bỏ qua phiên bản (nếu có)
            if (path.startsWith("v")) {
                path = path.substring(path.indexOf("/") + 1);
            }
            
            // Bỏ phần mở rộng file
            int lastDotIndex = path.lastIndexOf(".");
            if (lastDotIndex > 0) {
                path = path.substring(0, lastDotIndex);
            }
            
            return path;
        } catch (Exception e) {
            log.error("Lỗi khi trích xuất public ID từ URL: {}", e.getMessage());
            return null;
        }
    }

    @Override
    @Transactional
    public void deleteFeedback(Integer id) {
        User currentUser = getCurrentUser();
        
        // Kiểm tra sự tồn tại của đánh giá
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        // Kiểm tra quyền xóa (người dùng hoặc admin)
        if (!Objects.equals(feedback.getUserId(), currentUser.getId()) && !currentUser.getRole().getRoleName().equals("ADMIN")) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này");
        }
        
        // Lấy tất cả ảnh của đánh giá
        List<FeedbackImage> images = feedbackImageRepository.findByFeedbackIdOrderByDisplayOrderAsc(id);
        
        // Xóa ảnh trên Cloudinary
        for (FeedbackImage image : images) {
            try {
                String publicId = extractPublicIdFromUrl(image.getImageUrl());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            } catch (Exception e) {
                log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", e.getMessage());
            }
        }
        
        // Xóa ảnh từ database
        feedbackImageRepository.deleteByFeedbackId(id);
        
        // Xóa đánh giá
        feedbackRepository.deleteById(id);
    }

    @Override
    public FeedbackDTO getFeedbackById(Integer id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        return mapToDTO(feedback);
    }

    @Override
    public Page<FeedbackDTO> getFeedbacksByProductId(Integer productId, Pageable pageable) {
        Page<Feedback> feedbackPage = feedbackRepository.findByProductIdAndStatus(productId, "APPROVED", pageable);
        return feedbackPage.map(this::mapToDTO);
    }

    @Override
    public Page<FeedbackDTO> getFeedbacksByUserId(Integer userId, Pageable pageable) {
        Page<Feedback> feedbackPage = feedbackRepository.findByUserIdOrderByReviewDateDesc(userId, pageable);
        return feedbackPage.map(this::mapToDTO);
    }

    @Override
    public Map<String, Object> getFeedbackStatsByProductId(Integer productId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Tính điểm trung bình
        Double averageRating = feedbackRepository.getAverageRatingByProductId(productId);
        stats.put("averageRating", averageRating != null ? averageRating : 0.0);
        
        // Đếm tổng số đánh giá
        Long totalReviews = feedbackRepository.countApprovedByProductId(productId);
        stats.put("totalReviews", totalReviews);
        
        // Đếm số lượng đánh giá theo số sao
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            Long count = feedbackRepository.countByProductIdAndRating(productId, i);
            ratingDistribution.put(i, count);
        }
        stats.put("ratingDistribution", ratingDistribution);
        
        return stats;
    }

    @Override
    @Transactional
    public FeedbackDTO updateFeedbackStatus(Integer id, FeedbackStatus status) {
        User currentUser = getCurrentUser();
        
        // Debug thông tin người dùng và quyền
        System.out.println("===== UPDATE STATUS DEBUG =====");
        System.out.println("USER: " + currentUser.getEmail());
        System.out.println("ROLE: " + currentUser.getRole().getRoleName());
        System.out.println("AUTHORITIES: " + currentUser.getAuthorities());
        
        // Chỉ Admin mới có quyền thay đổi trạng thái (case insensitive)
        if (!currentUser.getRole().getRoleName().equalsIgnoreCase("Admin")) {
            throw new BadRequestException("Bạn không có quyền thay đổi trạng thái đánh giá");
        }
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        feedback.setStatus(status.name());
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        
        return mapToDTO(updatedFeedback);
    }

    @Override
    @Transactional
    public FeedbackDTO addReplyToFeedback(Integer id, String reply) {
        User currentUser = getCurrentUser();
        
        // Debug thông tin người dùng và quyền
        System.out.println("===== ADD REPLY DEBUG =====");
        System.out.println("USER: " + currentUser.getEmail());
        System.out.println("ROLE: " + currentUser.getRole().getRoleName());
        
        // Kiểm tra quyền phản hồi (chỉ Admin hoặc chủ sản phẩm) - case insensitive
        if (!currentUser.getRole().getRoleName().equalsIgnoreCase("Admin")) {
            throw new BadRequestException("Bạn không có quyền phản hồi đánh giá này");
        }
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        feedback.setReply(reply);
        feedback.setRepliedBy(currentUser.getId());
        feedback.setRepliedAt(LocalDateTime.now());
        
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        
        return mapToDTO(updatedFeedback);
    }

    @Override
    @Transactional
    public FeedbackDTO markFeedbackAsHelpful(Integer id) {
        User currentUser = getCurrentUser();
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        // Không thể đánh dấu đánh giá của chính mình
        if (Objects.equals(feedback.getUserId(), currentUser.getId())) {
            throw new BadRequestException("Bạn không thể đánh dấu đánh giá của chính mình");
        }
        
        // TODO: Có thể thêm bảng để lưu lịch sử người dùng đã đánh giá hữu ích để tránh trùng lặp
        
        feedback.setHelpfulCount(feedback.getHelpfulCount() + 1);
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        
        return mapToDTO(updatedFeedback);
    }

    @Override
    @Transactional
    public FeedbackDTO markFeedbackAsNotHelpful(Integer id) {
        User currentUser = getCurrentUser();
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        // Không thể đánh dấu đánh giá của chính mình
        if (Objects.equals(feedback.getUserId(), currentUser.getId())) {
            throw new BadRequestException("Bạn không thể đánh dấu đánh giá của chính mình");
        }
        
        // TODO: Có thể thêm bảng để lưu lịch sử người dùng đã đánh giá không hữu ích để tránh trùng lặp
        
        feedback.setNotHelpfulCount(feedback.getNotHelpfulCount() + 1);
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        
        return mapToDTO(updatedFeedback);
    }

    @Override
    public Page<FeedbackDTO> getPendingFeedbacks(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        // Debug thông tin người dùng và quyền
        System.out.println("===== GET PENDING FEEDBACKS DEBUG =====");
        System.out.println("USER: " + currentUser.getEmail());
        System.out.println("ROLE: " + currentUser.getRole().getRoleName());
        
        // Chỉ Admin mới có quyền xem danh sách đánh giá chờ duyệt (case insensitive)
        if (!currentUser.getRole().getRoleName().equalsIgnoreCase("Admin")) {
            throw new BadRequestException("Bạn không có quyền xem danh sách đánh giá chờ duyệt");
        }
        
        Page<Feedback> feedbackPage = feedbackRepository.findByStatusOrderByReviewDateDesc("PENDING", pageable);
        return feedbackPage.map(this::mapToDTO);
    }

    @Override
    public List<FeedbackDTO> getHighestRatedFeedbacks(Integer productId, Integer limit) {
        Page<Feedback> feedbacks = feedbackRepository.findByMinRatingAndProductId(productId, 4, Pageable.ofSize(limit));
        return feedbacks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDTO> getLowestRatedFeedbacks(Integer productId, Integer limit) {
        // Tìm đánh giá có rating thấp (1-2 sao)
        Page<Feedback> feedbacks = feedbackRepository.findByProductIdAndStatus(productId, "APPROVED", Pageable.ofSize(limit));
        
        return feedbacks.stream()
                .filter(f -> f.getRating() <= 2)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<FeedbackDTO> getFeedbacksByMinRating(Integer productId, Integer minRating, Pageable pageable) {
        Page<Feedback> feedbacks = feedbackRepository.findByMinRatingAndProductId(productId, minRating, pageable);
        return feedbacks.map(this::mapToDTO);
    }

    @Override
    public Page<FeedbackDTO> getVerifiedPurchaseFeedbacks(Integer productId, Pageable pageable) {
        Page<Feedback> feedbacks = feedbackRepository.findVerifiedPurchaseByProductId(productId, pageable);
        return feedbacks.map(this::mapToDTO);
    }

    /**
     * Xử lý các hình ảnh đánh giá
     */
    private void processImages(Feedback feedback, List<MultipartFile> images) {
        int displayOrder = 0;
        for (MultipartFile image : images) {
            if (!image.isEmpty()) {
                try {
                    // Tạo tên file
                    String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                    
                    // Lưu ảnh lên Cloudinary và lấy đường dẫn
                    String imageUrl = cloudinaryService.uploadImage(
                        image, 
                        FEEDBACK_IMAGE_PATH + "/" + feedback.getId(), 
                        fileName
                    );
                    
                    // Lưu thông tin ảnh
                    FeedbackImage feedbackImage = FeedbackImage.builder()
                            .feedbackId(feedback.getId())
                            .imageUrl(imageUrl)
                            .displayOrder(displayOrder++)
                            .build();
                    
                    feedbackImageRepository.save(feedbackImage);
                } catch (Exception e) {
                    log.error("Lỗi khi lưu ảnh đánh giá trên Cloudinary: {}", e.getMessage());
                }
            }
        }
    }

    /**
     * Ánh xạ từ entity sang DTO
     */
    private FeedbackDTO mapToDTO(Feedback feedback) {
        FeedbackDTO dto = feedbackMapper.toDTO(feedback);
        
        // Thêm thông tin sản phẩm
        if (feedback.getProduct() != null) {
            dto.setProductName(feedback.getProduct().getProductName());
            dto.setProductImage(feedback.getProduct().getImageUrl());
        }
        
        // Thêm danh sách ảnh đánh giá
        List<FeedbackImage> images = feedbackImageRepository.findByFeedbackIdOrderByDisplayOrderAsc(feedback.getId());
        dto.setImages(feedbackMapper.toImageDTOList(images));
        
        return dto;
    }

    /**
     * Chuyển đổi JSON string thành FeedbackDTO, xử lý enum case sensitivity
     */
    @Override
    public FeedbackDTO convertJsonToFeedbackDTO(String feedbackJson) throws Exception {
        try {
            // Đọc JSON thành Map 
            Map<String, Object> feedbackMap = objectMapper.readValue(feedbackJson, Map.class);
            
            // Tạo FeedbackDTO mới
            FeedbackDTO feedbackDTO = new FeedbackDTO();
            
            // Thiết lập các trường cơ bản
            if (feedbackMap.containsKey("id")) {
                feedbackDTO.setId((Integer) feedbackMap.get("id"));
            }
            if (feedbackMap.containsKey("productId")) {
                feedbackDTO.setProductId((Integer) feedbackMap.get("productId"));
            }
            if (feedbackMap.containsKey("rating")) {
                // Xử lý trường hợp rating là Integer hoặc Double
                Object ratingObj = feedbackMap.get("rating");
                if (ratingObj instanceof Integer) {
                    feedbackDTO.setRating((Integer) ratingObj);
                } else if (ratingObj instanceof Double) {
                    feedbackDTO.setRating(((Double) ratingObj).intValue());
                }
            }
            if (feedbackMap.containsKey("comment")) {
                feedbackDTO.setComment((String) feedbackMap.get("comment"));
            }
            
            // Xử lý enum status - chuyển đổi tường minh
            if (feedbackMap.containsKey("status") && feedbackMap.get("status") != null) {
                String statusStr = feedbackMap.get("status").toString().toUpperCase();
                try {
                    FeedbackStatus status = FeedbackStatus.valueOf(statusStr);
                    feedbackDTO.setStatus(status);
                } catch (IllegalArgumentException e) {
                    // Ghi log lỗi
                    log.error("Lỗi chuyển đổi enum status: {}", statusStr);
                    // Mặc định là PENDING nếu không thể chuyển đổi
                    feedbackDTO.setStatus(FeedbackStatus.PENDING);
                }
            }
            
            // Thêm các trường khác nếu cần
            if (feedbackMap.containsKey("userId")) {
                feedbackDTO.setUserId((Integer) feedbackMap.get("userId"));
            }
            
            return feedbackDTO;
        } catch (Exception e) {
            log.error("Lỗi xử lý JSON feedback: {}", e.getMessage());
            throw new IllegalArgumentException("Không thể xử lý dữ liệu JSON: " + e.getMessage());
        }
    }
} 