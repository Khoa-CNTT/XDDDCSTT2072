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
    
    private static final String FEEDBACK_IMAGE_PATH = "feedback-images";


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
        
        MarketPlace product = marketPlaceRepository.findById(feedbackDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + feedbackDTO.getProductId()));
        
        Optional<Feedback> existingFeedback = feedbackRepository.findByUserIdAndProductId(currentUser.getId(), feedbackDTO.getProductId());
        if (existingFeedback.isPresent()) {
            throw new BadRequestException("Bạn đã đánh giá sản phẩm này rồi");
        }
        
        if (!userHasPurchasedProduct(currentUser.getId(), feedbackDTO.getProductId())) {
            throw new BadRequestException("Bạn chưa mua sản phẩm này nên không thể đánh giá");
        }
        
        Feedback feedback = Feedback.builder()
                .userId(currentUser.getId())
                .productId(feedbackDTO.getProductId())
                .rating(feedbackDTO.getRating())
                .comment(feedbackDTO.getComment())
                .reviewDate(LocalDateTime.now())
                .status("APPROVED")
                .isVerifiedPurchase(true)
                .helpfulCount(0)
                .notHelpfulCount(0)
                .build();
        
        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        if (images != null && !images.isEmpty()) {
            processImages(savedFeedback, images);
        }
        
        return mapToDTO(savedFeedback);
    }

    @Override
    @Transactional
    public FeedbackDTO updateFeedback(Integer id, FeedbackDTO feedbackDTO, List<MultipartFile> images) {
        User currentUser = getCurrentUser();
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        if (!Objects.equals(feedback.getUserId(), currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa đánh giá này");
        }
        
        feedback.setRating(feedbackDTO.getRating());
        feedback.setComment(feedbackDTO.getComment());
        
        // Luôn gán status là APPROVED khi cập nhật 
        feedback.setStatus("APPROVED");
        
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        
        if (images != null && !images.isEmpty()) {
            List<FeedbackImage> oldImages = feedbackImageRepository.findByFeedbackIdOrderByDisplayOrderAsc(id);
            for (FeedbackImage oldImage : oldImages) {
                try {
                    String publicId = extractPublicIdFromUrl(oldImage.getImageUrl());
                    if (publicId != null) {
                        cloudinaryService.deleteImage(publicId);
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi xóa ảnh cũ trên Cloudinary: {}", e.getMessage());
                }
            }
            
            feedbackImageRepository.deleteByFeedbackId(updatedFeedback.getId());
            
            processImages(updatedFeedback, images);
        }
        
        return mapToDTO(updatedFeedback);
    }


    private String extractPublicIdFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length < 2) return null;
            
            String path = parts[1];
            if (path.startsWith("v")) {
                path = path.substring(path.indexOf("/") + 1);
            }
            
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
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + id));
        
        if (!Objects.equals(feedback.getUserId(), currentUser.getId()) && !currentUser.getRole().getRoleName().equals("ADMIN")) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này");
        }
        
        List<FeedbackImage> images = feedbackImageRepository.findByFeedbackIdOrderByDisplayOrderAsc(id);
        
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
        
        feedbackImageRepository.deleteByFeedbackId(id);
        
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
        
        Double averageRating = feedbackRepository.getAverageRatingByProductId(productId);
        stats.put("averageRating", averageRating != null ? averageRating : 0.0);
        
        Long totalReviews = feedbackRepository.countApprovedByProductId(productId);
        stats.put("totalReviews", totalReviews);
        
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
        
        System.out.println("===== ADD REPLY DEBUG =====");
        System.out.println("USER: " + currentUser.getEmail());
        System.out.println("ROLE: " + currentUser.getRole().getRoleName());
        
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
        
        if (Objects.equals(feedback.getUserId(), currentUser.getId())) {
            throw new BadRequestException("Bạn không thể đánh dấu đánh giá của chính mình");
        }
        

        feedback.setNotHelpfulCount(feedback.getNotHelpfulCount() + 1);
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        
        return mapToDTO(updatedFeedback);
    }

    @Override
    public Page<FeedbackDTO> getPendingFeedbacks(Pageable pageable) {
        User currentUser = getCurrentUser();
        
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


    @Override
    public boolean userHasReviewedProduct(Integer userId, Integer productId) {
        // Tìm feedback của người dùng cho sản phẩm này
        Optional<Feedback> existingFeedback = feedbackRepository.findByUserIdAndProductId(userId, productId);
        return existingFeedback.isPresent();
    }
    

    @Override
    public boolean userHasPurchasedProduct(Integer userId, Integer productId) {
        try {

            Integer count = feedbackRepository.countUserPurchasedProduct(userId, productId);
            
            System.out.println("DEBUG - Checking user " + userId + " purchased product " + productId);
            System.out.println("DEBUG - Count result: " + count);
            
            return count != null && count > 0;
        } catch (Exception e) {
            System.err.println("ERROR in userHasPurchasedProduct: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<Map<String, Object>> getUnreviewedProducts(Integer userId) {

        List<Map<String, Object>> result = new ArrayList<>();
        try {
            List<MarketPlace> products = marketPlaceRepository.findAll(Pageable.ofSize(5)).getContent();
            
            for (MarketPlace product : products) {
                boolean hasReviewed = userHasReviewedProduct(userId, product.getId());
                
                if (!hasReviewed) {
                    Map<String, Object> productInfo = new HashMap<>();
                    productInfo.put("id", product.getId());
                    productInfo.put("name", product.getProductName());
                    productInfo.put("imageUrl", product.getImageUrl());
                    productInfo.put("price", product.getPrice());
                    
                    result.add(productInfo);
                }
            }
        } catch (Exception e) {
            log.error("Error getting unreviewed products", e);
        }
        
        return result;
    }


    private void processImages(Feedback feedback, List<MultipartFile> images) {
        int displayOrder = 0;
        for (MultipartFile image : images) {
            if (!image.isEmpty()) {
                try {
                    String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                    
                    String imageUrl = cloudinaryService.uploadImage(
                        image, 
                        FEEDBACK_IMAGE_PATH + "/" + feedback.getId(), 
                        fileName
                    );
                    
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


    private FeedbackDTO mapToDTO(Feedback feedback) {
        FeedbackDTO dto = feedbackMapper.toDTO(feedback);
        
        if (feedback.getProduct() != null) {
            dto.setProductName(feedback.getProduct().getProductName());
            dto.setProductImage(feedback.getProduct().getImageUrl());
        }
        
        List<FeedbackImage> images = feedbackImageRepository.findByFeedbackIdOrderByDisplayOrderAsc(feedback.getId());
        dto.setImages(feedbackMapper.toImageDTOList(images));
        
        return dto;
    }


    @Override
    public FeedbackDTO convertJsonToFeedbackDTO(String feedbackJson) throws Exception {
        try {
            Map<String, Object> feedbackMap = objectMapper.readValue(feedbackJson, Map.class);
            
            FeedbackDTO feedbackDTO = new FeedbackDTO();
            
            if (feedbackMap.containsKey("id")) {
                feedbackDTO.setId((Integer) feedbackMap.get("id"));
            }
            if (feedbackMap.containsKey("productId")) {
                feedbackDTO.setProductId((Integer) feedbackMap.get("productId"));
            }
            if (feedbackMap.containsKey("rating")) {
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
            
            if (feedbackMap.containsKey("status") && feedbackMap.get("status") != null) {
                String statusStr = feedbackMap.get("status").toString().toUpperCase();
                try {
                    FeedbackStatus status = FeedbackStatus.valueOf(statusStr);
                    feedbackDTO.setStatus(status);
                } catch (IllegalArgumentException e) {
                    log.error("Lỗi chuyển đổi enum status: {}", statusStr);
                    // Mặc định là APPROVED nếu không thể chuyển đổi
                    feedbackDTO.setStatus(FeedbackStatus.APPROVED);
                }
            }
            
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