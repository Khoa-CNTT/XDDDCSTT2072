package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.SubscriptionPlanDTO;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.dto.response.PaymentUrlResponse;
import com.agricultural.agricultural.service.IPaymentService;
import com.agricultural.agricultural.service.ISubscriptionPlanService;
import com.agricultural.agricultural.utils.VNPayUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/subscription-plans")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionPlanController {
    
    private final ISubscriptionPlanService subscriptionPlanService;
    private final IPaymentService paymentService;
    private final VNPayUtils vnPayUtils;
    
    /**
     * Lấy tất cả các gói đăng ký đang hoạt động
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanDTO>>> getActivePlans() {
        List<SubscriptionPlanDTO> plans = subscriptionPlanService.getActivePlans();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gói đăng ký thành công", plans));
    }
    
    /**
     * Lấy thông tin gói đăng ký miễn phí
     */
    @GetMapping("/free")
    public ResponseEntity<ApiResponse<SubscriptionPlanDTO>> getFreePlan() {
        Optional<SubscriptionPlanDTO> planOptional = subscriptionPlanService.getFreePlan();
        if (planOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Không tìm thấy gói đăng ký miễn phí", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin gói miễn phí thành công", planOptional.get()));
    }
    
    /**
     * Lấy thông tin chi tiết của một gói đăng ký
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlanDTO>> getPlanById(@PathVariable String id) {
        try {
            Integer planId = Integer.parseInt(id);
            Optional<SubscriptionPlanDTO> planOptional = subscriptionPlanService.getPlanById(planId);
            
            if (planOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Không tìm thấy gói đăng ký với ID: " + planId, null));
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin gói đăng ký thành công", planOptional.get()));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "ID gói đăng ký không hợp lệ", null));
        }
    }
    
    /**
     * API tạo URL thanh toán cho gói đăng ký
     * POST /api/v1/subscription-plans/payment
     * 
     * Request Body:
     * {
     *   "orderId": 123,
     *   "paymentMethod": "VNPAY"
     * }
     */
    @PostMapping("/payment")
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> createSubscriptionPayment(
            @RequestBody PaymentRequest paymentRequest, 
            HttpServletRequest request) {
        
        log.info("Tạo URL thanh toán cho gói đăng ký ID: {}", paymentRequest.getOrderId());
        
        Integer planId = paymentRequest.getOrderId().intValue();
        if (planId == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "ID gói đăng ký không được để trống", null));
        }
        
        try {
            // Lấy thông tin gói đăng ký
            Optional<SubscriptionPlanDTO> planOptional = subscriptionPlanService.getPlanById(planId);
            
            if (planOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Không tìm thấy gói đăng ký với ID: " + planId, null));
            }
            
            SubscriptionPlanDTO plan = planOptional.get();
            
            // Nếu là gói miễn phí, không cần tạo thanh toán
            if (Boolean.TRUE.equals(plan.getIsFree())) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Gói đăng ký này miễn phí, không cần thanh toán", null));
            }
            
            // Tạo mô tả cho giao dịch
            if (paymentRequest.getDescription() == null || paymentRequest.getDescription().isEmpty()) {
                paymentRequest.setDescription("Thanh toán gói đăng ký " + plan.getName());
            }
            
            // Thiết lập số tiền
            paymentRequest.setAmount(plan.getPrice().longValue());
            
            // Lấy địa chỉ IP của người dùng cho VNPAY
            if ("VNPAY".equalsIgnoreCase(paymentRequest.getPaymentMethod())) {
                String ipAddress = vnPayUtils.getClientIpAddress(request);
                paymentRequest.setClientIp(ipAddress);
                log.info("Địa chỉ IP của người dùng cho VNPAY: {}", ipAddress);
            }
            
            // Gọi service để tạo URL thanh toán
            PaymentUrlResponse paymentUrl = paymentService.processPayment(paymentRequest);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo URL thanh toán thành công", paymentUrl));
        } catch (Exception e) {
            log.error("Lỗi khi tạo URL thanh toán: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Lỗi khi tạo URL thanh toán: " + e.getMessage(), null));
        }
    }
    
    // ========== API dành cho Admin ==========
    
    /**
     * Lấy tất cả các gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @GetMapping
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanDTO>>> getAllPlans() {
        List<SubscriptionPlanDTO> plans = subscriptionPlanService.getAllPlans();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gói đăng ký thành công", plans));
    }
    
    /**
     * Tạo gói đăng ký mới
     * Chỉ Admin mới có quyền truy cập
     */
    @PostMapping
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<SubscriptionPlanDTO>> createPlan(@Valid @RequestBody SubscriptionPlanDTO planDTO) {
        SubscriptionPlanDTO newPlan = subscriptionPlanService.createPlan(planDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo gói đăng ký mới thành công", newPlan));
    }
    
    /**
     * Cập nhật thông tin gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<SubscriptionPlanDTO>> updatePlan(
            @PathVariable String id, 
            @Valid @RequestBody SubscriptionPlanDTO planDTO) {
        try {
            Integer planId = Integer.parseInt(id);
            SubscriptionPlanDTO updatedPlan = subscriptionPlanService.updatePlan(planId, planDTO);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật gói đăng ký thành công", updatedPlan));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "ID gói đăng ký không hợp lệ", null));
        }
    }
    
    /**
     * Thay đổi trạng thái kích hoạt của gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<SubscriptionPlanDTO>> togglePlanStatus(
            @PathVariable String id,
            @RequestParam(required = true) Boolean active) {
        try {
            Integer planId = Integer.parseInt(id);
            SubscriptionPlanDTO updatedPlan = subscriptionPlanService.togglePlanStatus(planId, active);
            String message = active ? "Kích hoạt gói đăng ký thành công" : "Vô hiệu hóa gói đăng ký thành công";
            return ResponseEntity.ok(new ApiResponse<>(true, message, updatedPlan));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "ID gói đăng ký không hợp lệ", null));
        }
    }
    
    /**
     * Xóa gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<?>> deletePlan(@PathVariable String id) {
        try {
            Integer planId = Integer.parseInt(id);
            subscriptionPlanService.deletePlan(planId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa gói đăng ký thành công", null));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "ID gói đăng ký không hợp lệ", null));
        }
    }
} 