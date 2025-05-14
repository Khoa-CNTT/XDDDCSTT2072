package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.FeedbackDTO;
import com.agricultural.agricultural.dto.ResponseDTO;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.entity.enumeration.FeedbackStatus;
import com.agricultural.agricultural.service.IFeedbackService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.agricultural.agricultural.entity.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {
    
    private final IFeedbackService feedbackService;
    private final ObjectMapper objectMapper;
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<FeedbackDTO>> createFeedback(
            @RequestParam Integer productId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            @RequestParam(required = false) String status,
            @RequestParam(name = "images", required = false) List<MultipartFile> images) {
        
        try {
            // Lấy người dùng hiện tại
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Kiểm tra quyền đánh giá
            if (!feedbackService.userHasPurchasedProduct(currentUser.getId(), productId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ResponseDTO.error("PERMISSION_DENIED", "Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được xử lý nên không thể đánh giá"));
            }
            
            // Kiểm tra nếu đã đánh giá rồi
            if (feedbackService.userHasReviewedProduct(currentUser.getId(), productId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ResponseDTO.error("ALREADY_REVIEWED", "Bạn đã đánh giá sản phẩm này rồi"));
            }
            
            // Tạo FeedbackDTO từ các tham số riêng lẻ
            FeedbackDTO feedbackDTO = new FeedbackDTO();
            feedbackDTO.setProductId(productId);
            feedbackDTO.setRating(rating);
            feedbackDTO.setComment(comment);
            
            // Xử lý status nếu có
            if (status != null && !status.isEmpty()) {
                try {
                    // Chuyển đổi status thành chữ hoa và loại bỏ khoảng trắng
                    String statusUpperCase = status.toUpperCase().trim();
                    FeedbackStatus statusEnum = FeedbackStatus.valueOf(statusUpperCase);
                    feedbackDTO.setStatus(statusEnum);
                } catch (IllegalArgumentException e) {
                    // Ghi log lỗi
                    System.out.println("Lỗi chuyển đổi status: " + status + ", sử dụng giá trị mặc định APPROVED");
                    // Mặc định là APPROVED
                    feedbackDTO.setStatus(FeedbackStatus.APPROVED);
                }
            } else {
                // Nếu không có status, sử dụng APPROVED
                feedbackDTO.setStatus(FeedbackStatus.APPROVED);
            }
            
            // Gọi service để tạo đánh giá
            FeedbackDTO createdFeedback = feedbackService.createFeedback(feedbackDTO, images);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponseDTO.success(createdFeedback, "Đánh giá đã được tạo thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error("CREATE_ERROR", "Lỗi khi tạo đánh giá: " + e.getMessage()));
        }
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<FeedbackDTO>> updateFeedback(
            @PathVariable Integer id,
            @RequestParam Integer productId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            @RequestParam(required = false) String status,
            @RequestParam(name = "images", required = false) List<MultipartFile> images) {
        
        try {
            // Log thông tin request
            System.out.println("===== DEBUG UPDATE FEEDBACK =====");
            System.out.println("ID: " + id);
            System.out.println("ProductID: " + productId);
            System.out.println("Rating: " + rating);
            System.out.println("Comment: " + comment);
            System.out.println("Status input: " + status);
            
            // Tạo FeedbackDTO từ các tham số riêng lẻ
            FeedbackDTO feedbackDTO = new FeedbackDTO();
            feedbackDTO.setProductId(productId);
            feedbackDTO.setRating(rating);
            feedbackDTO.setComment(comment);
            
            // Xử lý status nếu có
            if (status != null && !status.isEmpty()) {
                try {
                    // Chuyển đổi status thành chữ hoa và loại bỏ khoảng trắng
                    String statusUpperCase = status.toUpperCase().trim();
                    System.out.println("Status after uppercase: " + statusUpperCase);
                    
                    FeedbackStatus statusEnum = FeedbackStatus.valueOf(statusUpperCase);
                    System.out.println("Status enum: " + statusEnum);
                    
                    feedbackDTO.setStatus(statusEnum);
                } catch (IllegalArgumentException e) {
                    // Ghi log lỗi
                    System.out.println("Lỗi chuyển đổi status: " + status + ", sử dụng giá trị mặc định APPROVED");
                    System.out.println("Error details: " + e.getMessage());
                    // Mặc định là APPROVED nếu không hợp lệ
                    feedbackDTO.setStatus(FeedbackStatus.APPROVED);
                }
            } else {
                // Nếu không có status, sử dụng APPROVED
                System.out.println("No status provided, using APPROVED");
                feedbackDTO.setStatus(FeedbackStatus.APPROVED);
            }
            
            System.out.println("Final status in DTO: " + feedbackDTO.getStatus());
            
            // Gọi service để cập nhật đánh giá
            FeedbackDTO updatedFeedback = feedbackService.updateFeedback(id, feedbackDTO, images);
            
            return ResponseEntity.ok(ResponseDTO.success(updatedFeedback, "Đánh giá đã được cập nhật thành công"));
        } catch (Exception e) {
            // Log chi tiết lỗi
            System.out.println("===== ERROR UPDATE FEEDBACK =====");
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error("UPDATE_ERROR", "Lỗi khi cập nhật đánh giá: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Void>> deleteFeedback(@PathVariable Integer id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ResponseDTO.success(null, "Đánh giá đã được xóa thành công"));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO<FeedbackDTO>> getFeedbackById(@PathVariable Integer id) {
        FeedbackDTO feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(ResponseDTO.success(feedback));
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<ResponseDTO<Page<FeedbackDTO>>> getFeedbacksByProductId(
            @PathVariable Integer productId,
            Pageable pageable) {
        
        Page<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByProductId(productId, pageable);
        return ResponseEntity.ok(ResponseDTO.success(feedbacks));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Page<FeedbackDTO>>> getFeedbacksByUserId(
            @PathVariable Integer userId,
            Pageable pageable) {
        
        Page<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByUserId(userId, pageable);
        return ResponseEntity.ok(ResponseDTO.success(feedbacks));
    }
    
    @GetMapping("/stats/product/{productId}")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getFeedbackStatsByProductId(
            @PathVariable Integer productId) {
        
        Map<String, Object> stats = feedbackService.getFeedbackStatsByProductId(productId);
        return ResponseEntity.ok(ResponseDTO.success(stats));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ResponseDTO<FeedbackDTO>> updateFeedbackStatus(
            @PathVariable Integer id,
            @RequestParam FeedbackStatus status) {
        
        FeedbackDTO updatedFeedback = feedbackService.updateFeedbackStatus(id, status);
        return ResponseEntity.ok(ResponseDTO.success(updatedFeedback, "Trạng thái đánh giá đã được cập nhật thành công"));
    }
    
    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ResponseDTO<FeedbackDTO>> addReplyToFeedback(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        
        String reply = request.get("reply");
        if (reply == null || reply.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error("VALIDATION_ERROR", "Nội dung phản hồi không được để trống"));
        }
        
        FeedbackDTO updatedFeedback = feedbackService.addReplyToFeedback(id, reply);
        return ResponseEntity.ok(ResponseDTO.success(updatedFeedback, "Phản hồi đã được thêm thành công"));
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ResponseDTO<Page<FeedbackDTO>>> getPendingFeedbacks(Pageable pageable) {
        Page<FeedbackDTO> feedbacks = feedbackService.getPendingFeedbacks(pageable);
        return ResponseEntity.ok(ResponseDTO.success(feedbacks));
    }
    
    @PostMapping("/{id}/helpful")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<FeedbackDTO>> markFeedbackAsHelpful(@PathVariable Integer id) {
        FeedbackDTO updatedFeedback = feedbackService.markFeedbackAsHelpful(id);
        return ResponseEntity.ok(ResponseDTO.success(updatedFeedback, "Đã đánh dấu đánh giá là hữu ích"));
    }
    
    @PostMapping("/{id}/not-helpful")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<FeedbackDTO>> markFeedbackAsNotHelpful(@PathVariable Integer id) {
        FeedbackDTO updatedFeedback = feedbackService.markFeedbackAsNotHelpful(id);
        return ResponseEntity.ok(ResponseDTO.success(updatedFeedback, "Đã đánh dấu đánh giá là không hữu ích"));
    }
    
    @GetMapping("/highest-rated/product/{productId}")
    public ResponseEntity<ResponseDTO<List<FeedbackDTO>>> getHighestRatedFeedbacks(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "5") Integer limit) {
        
        List<FeedbackDTO> feedbacks = feedbackService.getHighestRatedFeedbacks(productId, limit);
        return ResponseEntity.ok(ResponseDTO.success(feedbacks));
    }
    
    @GetMapping("/lowest-rated/product/{productId}")
    public ResponseEntity<ResponseDTO<List<FeedbackDTO>>> getLowestRatedFeedbacks(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "5") Integer limit) {
        
        List<FeedbackDTO> feedbacks = feedbackService.getLowestRatedFeedbacks(productId, limit);
        return ResponseEntity.ok(ResponseDTO.success(feedbacks));
    }
    
    @GetMapping("/verified-purchase/product/{productId}")
    public ResponseEntity<ResponseDTO<Page<FeedbackDTO>>> getVerifiedPurchaseFeedbacks(
            @PathVariable Integer productId,
            Pageable pageable) {
        
        Page<FeedbackDTO> feedbacks = feedbackService.getVerifiedPurchaseFeedbacks(productId, pageable);
        return ResponseEntity.ok(ResponseDTO.success(feedbacks));
    }
    
    /**
     * Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
     */
    @GetMapping("/check/product/{productId}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> checkUserFeedback(
            @PathVariable Integer productId) {
        
        // Lấy người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        boolean hasReviewed = feedbackService.userHasReviewedProduct(currentUser.getId(), productId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("hasReviewed", hasReviewed);
        
        return ResponseEntity.ok(ResponseDTO.success(result));
    }
    
    /**
     * Kiểm tra xem người dùng có thể đánh giá sản phẩm này không (đã mua và chưa đánh giá)
     */
    @GetMapping("/can-review/product/{productId}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> canReviewProduct(
            @PathVariable Integer productId) {
        
        // Lấy người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Debug log cho API này
        System.out.println("===== DEBUG can-review/product/{productId} =====");
        System.out.println("User ID: " + currentUser.getId());
        System.out.println("User Name: " + currentUser.getUsername());
        System.out.println("Product ID: " + productId);
        
        // Kiểm tra xem người dùng đã mua sản phẩm này chưa
        boolean hasPurchased = feedbackService.userHasPurchasedProduct(currentUser.getId(), productId);
        System.out.println("Has Purchased: " + hasPurchased);
        
        // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        boolean hasReviewed = feedbackService.userHasReviewedProduct(currentUser.getId(), productId);
        System.out.println("Has Reviewed: " + hasReviewed);
        
        // Có thể đánh giá nếu đã mua và chưa đánh giá
        boolean canReview = hasPurchased && !hasReviewed;
        System.out.println("Can Review: " + canReview);
        
        Map<String, Object> result = new HashMap<>();
        result.put("canReview", canReview);
        result.put("hasPurchased", hasPurchased);
        result.put("hasReviewed", hasReviewed);
        
        return ResponseEntity.ok(ResponseDTO.success(result));
    }
    
    /**
     * Lấy danh sách sản phẩm đã mua nhưng chưa đánh giá
     */
    @GetMapping("/unreviewed-products")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<List<Map<String, Object>>>> getUnreviewedProducts() {
        
        // Lấy người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Lấy danh sách sản phẩm đã mua nhưng chưa đánh giá
        List<Map<String, Object>> unreviewedProducts = feedbackService.getUnreviewedProducts(currentUser.getId());
        
        return ResponseEntity.ok(ResponseDTO.success(unreviewedProducts));
    }
} 