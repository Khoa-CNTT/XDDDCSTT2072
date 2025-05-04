package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.UserSubscriptionDTO;
import com.agricultural.agricultural.service.IUserSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/user-subscriptions")
@RequiredArgsConstructor
public class UserSubscriptionController {
    
    private final IUserSubscriptionService userSubscriptionService;
    
    // ========== API cho người dùng đăng nhập hiện tại ==========
    
    /**
     * Lấy tất cả gói đăng ký của người dùng đăng nhập hiện tại
     */
    @GetMapping
    public ResponseEntity<List<UserSubscriptionDTO>> getCurrentUserSubscriptions() {
        return ResponseEntity.ok(userSubscriptionService.getCurrentUserSubscriptions());
    }
    
    /**
     * Lấy gói đăng ký đang hoạt động mới nhất của người dùng đăng nhập hiện tại
     */
    @GetMapping("/active")
    public ResponseEntity<UserSubscriptionDTO> getCurrentUserActiveSubscription() {
        return userSubscriptionService.getCurrentUserActiveSubscription()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Đăng ký gói cho người dùng đăng nhập hiện tại
     */
    @PostMapping("/{planId}")
    public ResponseEntity<?> subscribeCurrentUserToPlan(
            @PathVariable String planId,
            @RequestParam(required = false, defaultValue = "false") Boolean autoRenew) {
        try {
            Integer planIdInt = Integer.parseInt(planId);
            UserSubscriptionDTO result = userSubscriptionService.subscribeCurrentUserToPlan(planIdInt, autoRenew);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID gói đăng ký không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Hủy đăng ký gói cho người dùng đăng nhập hiện tại
     */
    @DeleteMapping("/{subscriptionId}")
    public ResponseEntity<?> cancelSubscription(@PathVariable String subscriptionId) {
        try {
            Long subscriptionIdLong = Long.parseLong(subscriptionId);
            userSubscriptionService.cancelSubscription(subscriptionIdLong);
            return ResponseEntity.noContent().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID đăng ký không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Kiểm tra liệu người dùng có thể đăng ký thêm địa điểm
     */
    @GetMapping("/can-subscribe-more")
    public ResponseEntity<Boolean> canSubscribeMoreLocations() {
        Integer currentUserId = getCurrentUserId();
        return ResponseEntity.ok(userSubscriptionService.canSubscribeMoreLocations(currentUserId));
    }
    
    /**
     * Lấy số lượng địa điểm còn lại có thể đăng ký
     */
    @GetMapping("/remaining-locations")
    public ResponseEntity<Integer> getRemainingLocations() {
        Integer currentUserId = getCurrentUserId();
        return ResponseEntity.ok(userSubscriptionService.getRemainingLocations(currentUserId));
    }
    
    // ========== API dành cho Admin ==========
    
    /**
     * Lấy tất cả đăng ký trong hệ thống
     * Chỉ Admin mới có quyền truy cập
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<List<UserSubscriptionDTO>> getAllSubscriptions() {
        return ResponseEntity.ok(userSubscriptionService.getAllSubscriptions());
    }
    
    /**
     * Lấy tất cả gói đăng ký của một người dùng cụ thể
     * Chỉ Admin mới có quyền truy cập
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> getUserSubscriptions(@PathVariable String userId) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            return ResponseEntity.ok(userSubscriptionService.getUserSubscriptions(userIdInt));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID người dùng không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Lấy gói đăng ký đang hoạt động mới nhất của một người dùng cụ thể
     * Chỉ Admin mới có quyền truy cập
     */
    @GetMapping("/users/{userId}/active")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<UserSubscriptionDTO> getUserActiveSubscription(@PathVariable String userId) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            return userSubscriptionService.getLatestActiveSubscription(userIdInt)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            throw new com.agricultural.agricultural.exception.BadRequestException("Định dạng ID người dùng không hợp lệ");
        } catch (RuntimeException e) {
            throw new com.agricultural.agricultural.exception.BadRequestException(e.getMessage());
        }
    }
    
    /**
     * Đăng ký gói cho một người dùng cụ thể
     * Chỉ Admin mới có quyền truy cập
     */
    @PostMapping("/users/{userId}/plans/{planId}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> subscribeUserToPlan(
            @PathVariable String userId,
            @PathVariable String planId,
            @RequestParam(required = false, defaultValue = "false") Boolean autoRenew) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            Integer planIdInt = Integer.parseInt(planId);
            UserSubscriptionDTO result = userSubscriptionService.subscribeUserToPlan(userIdInt, planIdInt, autoRenew);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Kiểm tra liệu người dùng có thể đăng ký thêm địa điểm
     * Chỉ Admin mới có quyền truy cập
     */
    @GetMapping("/users/{userId}/can-subscribe-more")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> canUserSubscribeMoreLocations(@PathVariable String userId) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            return ResponseEntity.ok(userSubscriptionService.canSubscribeMoreLocations(userIdInt));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID người dùng không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Lấy số lượng địa điểm còn lại có thể đăng ký của một người dùng cụ thể
     * Chỉ Admin mới có quyền truy cập
     */
    @GetMapping("/users/{userId}/remaining-locations")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> getUserRemainingLocations(@PathVariable String userId) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            return ResponseEntity.ok(userSubscriptionService.getRemainingLocations(userIdInt));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID người dùng không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    // Phương thức trợ giúp để lấy ID người dùng hiện tại
    private Integer getCurrentUserId() {
        try {
            return com.agricultural.agricultural.utils.SecurityUtils.getCurrentUserId();
        } catch (RuntimeException e) {
            throw new com.agricultural.agricultural.exception.BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
    }
} 