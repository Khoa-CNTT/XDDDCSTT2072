package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.dto.response.PaymentQRDTO;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import com.agricultural.agricultural.repository.IPaymentRepository;
import com.agricultural.agricultural.service.impl.MomoPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/payment/momo")
@RequiredArgsConstructor
@Slf4j
public class MomoPaymentController {

    private final MomoPaymentService momoPaymentService;
    private final IPaymentRepository paymentRepository;

    /**
     * Tạo mã QR thanh toán Momo
     * POST /api/v1/payment/momo/create-qr
     * 
     * Request Body:
     * {
     *   "orderId": 123,
     *   "amount": 10000,
     *   "description": "Thanh toán đơn hàng #123"
     * }
     */
    @PostMapping("/create-qr")
    public ResponseEntity<ApiResponse<PaymentQRDTO>> createMomoQR(
            @RequestBody PaymentRequest paymentRequest,
            HttpServletRequest request) {
        
        log.info("Tạo mã QR Momo cho đơn hàng ID: {}, số tiền: {}", 
                paymentRequest.getOrderId(), paymentRequest.getAmount());
        
        // Lấy thông tin người dùng hiện tại
        Integer currentUserId = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof com.agricultural.agricultural.entity.User) {
                    com.agricultural.agricultural.entity.User user = (com.agricultural.agricultural.entity.User) principal;
                    currentUserId = user.getId();
                }
            }
        } catch (Exception e) {
            log.warn("Không thể lấy thông tin người dùng: {}", e.getMessage());
        }
        
        // Tạo mã QR thanh toán
        PaymentQRDTO paymentQRDTO = momoPaymentService.createMomoQRCode(paymentRequest, currentUserId);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true, 
                "Tạo mã QR thanh toán Momo thành công", 
                paymentQRDTO
        ));
    }
    
    /**
     * Xử lý callback từ Momo khi thanh toán hoàn tất
     * GET /api/v1/payment/momo/return
     */
    @GetMapping("/return")
    public ResponseEntity<?> handleMomoReturn(@RequestParam Map<String, String> params) {
        log.info("Nhận callback từ Momo Return URL với params: {}", params);
        
        String resultCode = params.get("resultCode");
        String orderInfo = params.get("orderInfo");
        String amount = params.get("amount");
        String transId = params.get("transId");
        String orderId = params.get("orderId");
        
        boolean isSuccess = "0".equals(resultCode);
        String message = isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại";
        
        // Tìm giao dịch theo orderId trong payment_note
        Optional<Payment> paymentOpt = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentNote() != null && p.getPaymentNote().contains(orderId))
                .findFirst();
        
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
            payment.setTransactionReference(transId);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Cập nhật trạng thái thanh toán: {}", payment.getStatus());
        } else {
            log.warn("Không tìm thấy giao dịch với orderId: {}", orderId);
        }
        
        // Tạo trang HTML để hiển thị kết quả và chuyển hướng người dùng
        StringBuilder htmlBuilder = new StringBuilder();
        htmlBuilder.append("<!DOCTYPE html>");
        htmlBuilder.append("<html>");
        htmlBuilder.append("<head>");
        htmlBuilder.append("<meta charset=\"UTF-8\">");
        htmlBuilder.append("<title>").append(isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại").append("</title>");
        htmlBuilder.append("<style>");
        htmlBuilder.append("body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }");
        htmlBuilder.append(".success { color: green; }");
        htmlBuilder.append(".failure { color: red; }");
        htmlBuilder.append("button { padding: 10px 20px; margin-top: 20px; cursor: pointer; }");
        htmlBuilder.append("</style>");
        htmlBuilder.append("</head>");
        htmlBuilder.append("<body>");
        
        if (isSuccess) {
            htmlBuilder.append("<h1 class=\"success\">Thanh toán thành công</h1>");
            htmlBuilder.append("<p>Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.</p>");
            htmlBuilder.append("<p>Mã giao dịch: ").append(transId).append("</p>");
            htmlBuilder.append("<p>Số tiền: ").append(amount).append(" VNĐ</p>");
        } else {
            htmlBuilder.append("<h1 class=\"failure\">Thanh toán thất bại</h1>");
            htmlBuilder.append("<p>").append(message).append("</p>");
        }
        
        htmlBuilder.append("<button onclick=\"window.location.href='/'\">Quay lại trang chủ</button>");
        htmlBuilder.append("</body>");
        htmlBuilder.append("</html>");
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(htmlBuilder.toString());
    }
    
    /**
     * Xử lý callback IPN từ Momo
     * POST /api/v1/payment/momo/ipn
     */
    @PostMapping("/ipn")
    public ResponseEntity<?> handleMomoIPN(@RequestBody Map<String, Object> body) {
        log.info("Nhận IPN từ Momo: {}", body);
        
        String resultCode = (String) body.get("resultCode");
        String orderId = (String) body.get("orderId");
        String transId = (String) body.get("transId");
        String amount = body.get("amount").toString();
        
        boolean isSuccess = "0".equals(resultCode);
        
        // Tìm giao dịch theo orderId trong payment_note
        Optional<Payment> paymentOpt = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentNote() != null && p.getPaymentNote().contains(orderId))
                .findFirst();
        
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
            payment.setTransactionReference(transId);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Cập nhật trạng thái thanh toán từ IPN: {}", payment.getStatus());
        } else {
            log.warn("Không tìm thấy giao dịch với orderId: {}", orderId);
        }
        
        // Response theo yêu cầu của Momo
        return ResponseEntity.ok(Map.of(
                "partnerCode", body.get("partnerCode"),
                "orderId", orderId,
                "requestId", body.get("requestId"),
                "message", "Ghi nhận thanh toán",
                "resultCode", 0
        ));
    }
    
    /**
     * Kiểm tra trạng thái thanh toán
     * GET /api/v1/payment/momo/status/{transactionId}
     */
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkPaymentStatus(@PathVariable String transactionId) {
        log.info("Kiểm tra trạng thái thanh toán Momo cho giao dịch: {}", transactionId);
        
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(transactionId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy giao dịch", null));
        }
        
        Payment payment = paymentOpt.get();
        boolean isSuccess = PaymentStatus.COMPLETED.equals(payment.getStatus());
        
        PaymentResponse response = PaymentResponse.builder()
                .success(isSuccess)
                .message("Trạng thái thanh toán: " + payment.getStatus().name())
                .orderId(Long.valueOf(payment.getOrderId()))
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Trạng thái thanh toán", 
                response
        ));
    }
} 