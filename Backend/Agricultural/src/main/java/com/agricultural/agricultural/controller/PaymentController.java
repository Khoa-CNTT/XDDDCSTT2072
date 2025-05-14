package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.config.VNPAYConfig;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.dto.NotificationDTO;
import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.request.RefundRequest;
import com.agricultural.agricultural.dto.response.PaymentDTO;
import com.agricultural.agricultural.dto.response.PaymentQRDTO;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.dto.response.PaymentUrlResponse;
import com.agricultural.agricultural.entity.Order;
import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.repository.IOrderRepository;
import com.agricultural.agricultural.repository.IPaymentRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IPaymentService;
import com.agricultural.agricultural.service.impl.MomoPaymentService;
import com.agricultural.agricultural.utils.VNPayUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("${api.prefix}/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final IPaymentService paymentService;
    private final VNPayUtils vnPayUtils;
    private final ObjectMapper objectMapper;
    private final IPaymentRepository paymentRepository;
    private final IUserRepository userRepository;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * API tạo URL thanh toán VNPAY
     * POST /api/v1/payment/create
     * 
     * Request Body:
     * {
     *   "orderId": 123,
     *   "amount": 10000,
     *   "paymentMethod": "VNPAY",
     *   "description": "Thanh toán đơn hàng #123"
     * }
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> createPayment(@RequestBody PaymentRequest paymentRequest, HttpServletRequest request) {
        log.info("Tạo URL thanh toán cho đơn hàng ID: {}", paymentRequest.getOrderId());
        
        // Lấy địa chỉ IP của người dùng cho VNPAY
        if ("VNPAY".equalsIgnoreCase(paymentRequest.getPaymentMethod())) {
            String ipAddress = vnPayUtils.getClientIpAddress(request);
            paymentRequest.setClientIp(ipAddress);
            log.info("Địa chỉ IP của người dùng cho VNPAY: {}", ipAddress);
        }
        
        PaymentUrlResponse paymentUrl = paymentService.processPayment(paymentRequest);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo URL thanh toán thành công", paymentUrl));
    }

    /**
     * API test tạo URL thanh toán VNPAY với dữ liệu mẫu
     * GET /api/v1/payment/test-create-vnpay?orderId=123&amount=10000
     * 
     * Không yêu cầu đơn hàng thật - tạo trực tiếp URL thanh toán VNPAY
     */
    @GetMapping("/test-create-vnpay")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testCreateVnpayPayment(
            @RequestParam(required = false, defaultValue = "123") Long orderId,
            @RequestParam(required = false, defaultValue = "10000") Long amount,
            @RequestParam(required = false, defaultValue = "Thanh toán đơn hàng") String description,
            HttpServletRequest request,
            Principal principal) {
        
        log.info("Test tạo URL thanh toán VNPAY cho đơn hàng ID: {}, số tiền: {}", orderId, amount);
        
        try {
            // Lấy IP của client
            String ipAddress = vnPayUtils.getClientIpAddress(request);
            
            // Gọi service để xử lý logic
            Map<String, Object> result = paymentService.createTestVnpayUrl(orderId, amount, description, ipAddress);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo URL thanh toán VNPAY mẫu thành công", result));
        } catch (Exception e) {
            log.error("Lỗi khi tạo URL thanh toán VNPAY mẫu: {}", e.getMessage(), e);
            
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi tạo URL thanh toán VNPAY mẫu", result));
        }
    }

    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refund(@RequestBody RefundRequest refundRequest) {
        log.info("Yêu cầu hoàn tiền cho giao dịch: {}", refundRequest.getTransactionId());
        PaymentResponse response = paymentService.processRefund(refundRequest);
        return ResponseEntity.ok(new ApiResponse<>(response.isSuccess(), response.getMessage(), response));
    }

    @GetMapping("/history/{orderId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentHistory(@PathVariable Long orderId) {
        log.info("Lấy lịch sử thanh toán cho đơn hàng ID: {}", orderId);
        Optional<PaymentDTO> paymentOpt = paymentService.getPaymentHistory(orderId);
        
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán cho đơn hàng này", null));
        }
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy lịch sử thanh toán thành công", paymentOpt.get()));
    }

    /**
     * Lấy tất cả lịch sử thanh toán của một đơn hàng
     * GET /api/v1/payment/history/all/{orderId}
     */
    @GetMapping("/history/all/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getAllPaymentHistory(@PathVariable Long orderId) {
        log.info("Lấy tất cả lịch sử thanh toán cho đơn hàng ID: {}", orderId);
        List<PaymentDTO> payments = paymentService.getAllPaymentHistoryByOrderId(orderId);
        
        if (payments.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán cho đơn hàng này", Collections.emptyList()));
        }
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy tất cả lịch sử thanh toán thành công", payments));
    }

    @GetMapping("/check/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkPaymentStatus(@PathVariable String transactionId) {
        log.info("Kiểm tra trạng thái thanh toán với transaction ID: {}", transactionId);
        
        try {
            // Lưu transaction_id vào localStorage để sử dụng sau này
            PaymentResponse response = paymentService.checkPaymentStatus(transactionId);
            
            // Kiểm tra và bổ sung vnp_TransactionNo nếu có trong data nhận về
            Map<String, Object> additionalInfo = response.getAdditionalInfo();
            if (additionalInfo != null && additionalInfo.containsKey("vnp_TransactionNo")) {
                String vnpTransactionNo = (String) additionalInfo.get("vnp_TransactionNo");
                log.info("Đã tìm thấy vnp_TransactionNo: {} từ giao dịch: {}", vnpTransactionNo, transactionId);
                
                // Bổ sung thông tin này vào response để frontend có thể sử dụng
                additionalInfo.put("transaction_no", vnpTransactionNo);
            }
            
            return ResponseEntity.ok(new ApiResponse<>(
                response.isSuccess(),
                response.getMessage(),
                response
            ));
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra trạng thái thanh toán: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>(
                false,
                "Lỗi khi kiểm tra trạng thái thanh toán: " + e.getMessage(),
                null
            ));
        }
    }

    /**
     * API test tạo một thanh toán mẫu và kiểm tra trạng thái của nó
     * GET /api/v1/payment/test-payment?orderId=123&status=COMPLETED
     */
    @GetMapping("/test-payment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testPayment(
            @RequestParam Long orderId,
            @RequestParam(required = false, defaultValue = "PENDING") String status) {
        
        log.info("Test tạo thanh toán mẫu cho đơn hàng ID: {}, trạng thái: {}", orderId, status);
        
        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("status", status);
        result.put("amount", 10000);
        result.put("message", "Đây là thanh toán mẫu cho mục đích kiểm thử");
        result.put("transactionId", "TEST_" + System.currentTimeMillis());
        result.put("paymentMethod", "VNPAY");
        result.put("createdAt", System.currentTimeMillis());
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo thanh toán mẫu thành công", result));
    }

    /**
     * VNPAY return URL - Xử lý kết quả thanh toán khi VNPAY chuyển hướng người dùng về
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<?> handleVnpayReturn(HttpServletRequest request) {
        try {
            log.info("Nhận callback từ VNPAY Return URL - URI: {}, Query String: {}", 
                     request.getRequestURI(), request.getQueryString());
            
            Map<String, String> vnpParams = new HashMap<>();
            
            // Phương pháp 1: Lấy tất cả tham số từ request parameters
            Enumeration<String> paramNames = request.getParameterNames();
            while (paramNames.hasMoreElements()) {
                String paramName = paramNames.nextElement();
                String paramValue = request.getParameter(paramName);
                vnpParams.put(paramName, paramValue);
            }
            
            log.info("VNPAY Return Params (từ request): {}", vnpParams);
            
            // Phương pháp 2: Phân tích thủ công query string nếu không lấy được từ parameters
            if (vnpParams.isEmpty() && request.getQueryString() != null) {
                log.info("Đang phân tích query string thủ công: {}", request.getQueryString());
                String[] pairs = request.getQueryString().split("&");
                for (String pair : pairs) {
                    if (pair.contains("=")) {
                        String[] keyValue = pair.split("=", 2);
                        String key = keyValue[0];
                        String value = keyValue.length > 1 ? 
                                URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8) : "";
                        vnpParams.put(key, value);
                    }
                }
                log.info("VNPAY Return Params (từ query string): {}", vnpParams);
            }
            
            // Kiểm tra kết quả thanh toán
            if (vnpParams.isEmpty()) {
                log.error("Không nhận được tham số từ VNPAY");
                return redirect(frontendUrl + "/payment/failure?error=no_parameters");
            }
            
            String responseCode = vnpParams.get("vnp_ResponseCode");
            if (responseCode == null) {
                log.error("Thiếu tham số vnp_ResponseCode trong callback");
                return redirect(frontendUrl + "/payment/failure?error=missing_response_code");
            }
            
            // Ghi log toàn bộ tham số nhận được
            log.info("Tất cả tham số VNPAY Return:");
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                log.info("  {} = {}", entry.getKey(), entry.getValue());
            }
            
            // Xác thực chữ ký từ VNPAY
            boolean isValidSignature = vnPayUtils.validateVnpayCallback(vnpParams);
            log.info("Kết quả xác thực chữ ký VNPAY: {}", isValidSignature ? "HỢP LỆ" : "KHÔNG HỢP LỆ");
            
            if (!isValidSignature) {
                log.error("Chữ ký không hợp lệ từ VNPAY Return");
                return redirect(frontendUrl + "/payment/failure?error=invalid_signature");
            }
            
            // Xử lý kết quả thanh toán và gọi service
            String message;
            if ("00".equals(responseCode)) {
                // Thanh toán thành công
                String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
                String vnp_Amount = vnpParams.get("vnp_Amount");
                
                log.info("Thanh toán thành công - TxnRef: {}, Amount: {}", 
                         vnp_TxnRef, vnp_Amount);
                
                // Xử lý logic cập nhật trạng thái thanh toán
                try {
                    PaymentResponse response = paymentService.processVnpayReturn(vnpParams);
                    log.info("Kết quả xử lý callback: {}", response);
                    message = "payment_success";
                } catch (Exception e) {
                    log.error("Lỗi xử lý callback thành công: {}", e.getMessage(), e);
                    // Thêm log chi tiết hơn để phân tích lỗi
                    if (e.getCause() != null) {
                        log.error("Nguyên nhân gốc: {}", e.getCause().getMessage());
                    }
                    log.error("Stack trace đầy đủ:", e);
                    message = "payment_processing_error";
                    return redirect(frontendUrl + "/payment/failure?message=processing_error&error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8));
                }
                
                // Chuyển hướng về trang thành công
                return redirect(frontendUrl + "/payment/success?message=" + message);
            } else {
                // Thanh toán thất bại
                log.warn("Thanh toán thất bại với mã lỗi: {}", responseCode);
                message = "payment_failed_code_" + responseCode;
                
                return redirect(frontendUrl + "/payment/failure?message=" + message);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý callback từ VNPAY: {}", e.getMessage(), e);
            // Thêm log chi tiết hơn để phân tích lỗi
            if (e.getCause() != null) {
                log.error("Nguyên nhân gốc: {}", e.getCause().getMessage());
            }
            log.error("Stack trace đầy đủ:", e);
            return redirect(frontendUrl + "/payment/failure?error=" + URLEncoder.encode("unexpected_error: " + e.getMessage(), StandardCharsets.UTF_8));
        }
    }
    
    private ResponseEntity<String> redirect(String url) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, url)
                .build();
    }
    
    /**
     * VNPAY IPN URL - Xử lý IPN (Instant Payment Notification) từ VNPAY
     * IPN được gọi tự động từ VNPAY để cập nhật trạng thái thanh toán
     * IPN phải trả về đúng định dạng theo yêu cầu của VNPAY
     */
    @PostMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(HttpServletRequest request) {
        log.info("===== BẮT ĐẦU XỬ LÝ IPN TỪ VNPAY =====");
        log.info("Request URI: {}, Method: {}", request.getRequestURI(), request.getMethod());
        
        Map<String, String> ipnResponse = new HashMap<>();
        
        try {
            // Lấy tất cả tham số từ request
            Map<String, String> vnpParams = new HashMap<>();
            Enumeration<String> params = request.getParameterNames();
            while (params.hasMoreElements()) {
                String param = params.nextElement();
                String value = request.getParameter(param);
                vnpParams.put(param, value);
            }
            
            // Log tất cả tham số nhận được
            log.info("VNPAY IPN Params:");
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                log.info("  {} = {}", entry.getKey(), entry.getValue());
            }
            
            // Kiểm tra các tham số bắt buộc
            String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
            String vnp_TransactionNo = vnpParams.get("vnp_TransactionNo");
            String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnp_SecureHash = vnpParams.get("vnp_SecureHash");
            String vnp_Amount = vnpParams.get("vnp_Amount");
            
            if (vnp_TxnRef == null || vnp_ResponseCode == null || vnp_SecureHash == null) {
                log.error("Thiếu tham số bắt buộc trong IPN: vnp_TxnRef, vnp_ResponseCode hoặc vnp_SecureHash");
                ipnResponse.put("RspCode", "99");
                ipnResponse.put("Message", "Invalid parameters");
                return ResponseEntity.ok(ipnResponse);
            }
            
            // Kiểm tra xem có phải là request test không
            boolean isTestRequest = false;
            if (vnpParams.containsKey("user_id")) {
                log.info("Phát hiện request test IPN với user_id: {}", vnpParams.get("user_id"));
                isTestRequest = true;
            }
            
            // Xác thực chữ ký từ VNPAY
            boolean isValidSignature = vnPayUtils.validateVnpayCallback(vnpParams);
            log.info("Kết quả xác thực chữ ký VNPAY IPN: {}", isValidSignature ? "HỢP LỆ" : "KHÔNG HỢP LỆ");
            
            if (!isValidSignature) {
                log.error("Chữ ký không hợp lệ từ VNPAY IPN");
                
                // Log thêm thông tin chi tiết để debug
                log.error("Hash cần xác thực: {}", vnp_SecureHash);
                
                // Tạo lại chữ ký để so sánh (chỉ phục vụ debug)
                Map<String, String> vnpParamsForHash = new TreeMap<>(vnpParams);
                vnpParamsForHash.remove("vnp_SecureHash");
                vnpParamsForHash.remove("vnp_SecureHashType");
                
                StringBuilder hashData = new StringBuilder();
                for (Map.Entry<String, String> entry : vnpParamsForHash.entrySet()) {
                    String fieldName = entry.getKey();
                    String fieldValue = entry.getValue();
                    if ((fieldValue != null) && (fieldValue.length() > 0)) {
                        try {
                            hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                            if (hashData.charAt(hashData.length() - 1) == '+') {
                                hashData.setCharAt(hashData.length() - 1, ' ');
                            }
                            hashData.append('&');
                        } catch (UnsupportedEncodingException e) {
                            log.error("Lỗi mã hóa tham số: {}", e.getMessage(), e);
                        }
                    }
                }
                
                if (hashData.length() > 0) {
                    hashData.setLength(hashData.length() - 1);
                }
                
                String calculatedHash = vnPayUtils.hmacSHA512(vnPayUtils.getVnpayConfig().getHashSecret(), hashData.toString());
                log.error("Hash tính toán được: {}", calculatedHash);
                log.error("HashData: {}", hashData.toString());
                
                // Cho phép request test đi qua dù chữ ký không hợp lệ (chỉ dùng cho development)
                if (isTestRequest) {
                    log.warn("Cho phép request test tiếp tục mặc dù chữ ký không hợp lệ");
                } else {
                    ipnResponse.put("RspCode", "97");
                    ipnResponse.put("Message", "Invalid signature");
                    return ResponseEntity.ok(ipnResponse);
                }
            }
            
            // Xử lý IPN và lưu kết quả thanh toán
            try {
                PaymentResponse response = paymentService.processVnpayIpn(vnpParams);
                log.info("Kết quả xử lý IPN: {}", response);
                
                if (response.isSuccess()) {
                    ipnResponse.put("RspCode", "00");
                    ipnResponse.put("Message", "Confirmed");
                } else {
                    ipnResponse.put("RspCode", "99");
                    ipnResponse.put("Message", "Transaction processing error");
                }
            } catch (Exception e) {
                log.error("Lỗi xử lý IPN: {}", e.getMessage(), e);
                ipnResponse.put("RspCode", "99");
                ipnResponse.put("Message", "Transaction processing error");
            }
            
            // Ghi log kết quả xử lý
            log.info("IPN response: {}", ipnResponse);
            log.info("===== KẾT THÚC XỬ LÝ IPN TỪ VNPAY =====");
            
            // Trả về kết quả theo định dạng yêu cầu của VNPAY
            return ResponseEntity.ok(ipnResponse);
        } catch (Exception e) {
            log.error("Lỗi không xác định khi xử lý IPN từ VNPAY: {}", e.getMessage(), e);
            
            ipnResponse.put("RspCode", "99");
            ipnResponse.put("Message", "Unknown error");
            return ResponseEntity.ok(ipnResponse);
        }
    }
    
    /**
     * API mô phỏng webhook VNPAY để test
     * POST /api/v1/payment/simulate-vnpay-ipn
     * 
     * Request Body:
     * {
     *   "vnp_TxnRef": "123",
     *   "vnp_Amount": "1000000",
     *   "vnp_ResponseCode": "00",
     *   "vnp_TransactionNo": "13349437"
     * }
     */
    @PostMapping("/simulate-vnpay-ipn")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulateVnpayIpn(
            @RequestBody Map<String, String> params,
            Principal principal) {
        log.info("Mô phỏng IPN từ VNPAY với params: {}", params);
        
        try {
            // Gọi service để xử lý logic
            Map<String, Object> result = paymentService.simulateVnpayIpn(params);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Mô phỏng IPN thành công", result));
        } catch (Exception e) {
            log.error("Lỗi khi mô phỏng IPN: {}", e.getMessage());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Lỗi khi mô phỏng IPN: " + e.getMessage());
            result.put("params", params);
            
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi mô phỏng IPN", result));
        }
    }
    
    /**
     * Trang thanh toán thành công (redirect từ VNPAY)
     */
    @GetMapping("/success")
    public ResponseEntity<String> paymentSuccess() {
        String html = "<html><body>"
                + "<h1>Thanh toán thành công</h1>"
                + "<p>Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.</p>"
                + "<p><a href='/'>Quay lại trang chủ</a></p>"
                + "</body></html>";
        
        return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
    }
    
    /**
     * Trang thanh toán thất bại (redirect từ VNPAY)
     */
    @GetMapping("/cancel")
    public ResponseEntity<String> paymentCancel() {
        String html = "<html><body>"
                + "<h1>Thanh toán thất bại hoặc đã bị hủy</h1>"
                + "<p>Đơn hàng của bạn chưa được thanh toán.</p>"
                + "<p><a href='/'>Quay lại trang chủ</a></p>"
                + "</body></html>";
        
        return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
    }
    
    /**
     * Tạo mã QR thanh toán VNPAY
     * POST /api/v1/payment/create-qr
     * 
     * Request Body:
     * {
     *   "orderId": 123,
     *   "amount": 10000,
     *   "description": "Thanh toán đơn hàng #123",
     *   "returnUrl": "https://yourdomain.com/payment/return"
     * }
     * 
     * @param paymentRequest Thông tin yêu cầu thanh toán
     * @param request HttpServletRequest
     * @return Thông tin mã QR thanh toán
     */
    @PostMapping("/create-qr")
    public ResponseEntity<ApiResponse<PaymentQRDTO>> createPaymentQR(
            @RequestBody PaymentRequest paymentRequest,
            HttpServletRequest request) {
        
        log.info("Tạo mã QR thanh toán cho đơn hàng ID: {}, số tiền: {}", 
                paymentRequest.getOrderId(), paymentRequest.getAmount());
        
        // Lấy địa chỉ IP của người dùng
        String ipAddress = vnPayUtils.getClientIpAddress(request);
        paymentRequest.setClientIp(ipAddress);
        
        // Thiết lập phương thức thanh toán là VNPAY
        paymentRequest.setPaymentMethod("VNPAY");
        
        // Tạo mã QR thanh toán
        PaymentQRDTO paymentQRDTO = paymentService.createPaymentQRCode(paymentRequest);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true, 
                "Tạo mã QR thanh toán thành công", 
                paymentQRDTO
        ));
    }

    /**
     * API test tính năng thanh toán VNPAY và kiểm tra cấu hình
     * GET /api/v1/payment/test-vnpay
     */
    @GetMapping("/test-vnpay")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testVnpayConfig() {
        log.info("Kiểm tra cấu hình VNPAY");
        
        Map<String, Object> responseData = new HashMap<>();
        
        // Thông tin cấu hình cơ bản
        responseData.put("tmn_code", vnPayUtils.getVnpayConfig().getTmnCode());
        responseData.put("version", vnPayUtils.getVnpayConfig().getVersion());
        responseData.put("command", vnPayUtils.getVnpayConfig().getCommand());
        responseData.put("url", vnPayUtils.getVnpayConfig().getUrl());
        
        // Thông tin URL callback
        responseData.put("return_url", vnPayUtils.getVnpayConfig().getReturnUrl());
        responseData.put("ipn_url", vnPayUtils.getVnpayConfig().getIpnUrl());
        
        // Thông tin thời gian hiện tại
        responseData.put("server_time", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        
        // Tạo URL test không cần kiểm tra đơn hàng thật
        try {
            // Tạo tham số truy vấn
            Map<String, String> vnp_Params = new TreeMap<>();
            vnp_Params.put("vnp_Version", vnPayUtils.getVnpayConfig().getVersion());
            vnp_Params.put("vnp_Command", vnPayUtils.getVnpayConfig().getCommand());
            vnp_Params.put("vnp_TmnCode", vnPayUtils.getVnpayConfig().getTmnCode());
            vnp_Params.put("vnp_Amount", String.valueOf(1000000)); // 10,000 VND
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", "TEST" + System.currentTimeMillis());
            vnp_Params.put("vnp_OrderInfo", "Thanh toan test VNPAY");
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnPayUtils.getVnpayConfig().getReturnUrl());
            vnp_Params.put("vnp_IpAddr", "127.0.0.1");
            
            String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            
            // Tạo chuỗi hash data
            StringBuilder hashData = new StringBuilder();
            for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
                String fieldName = entry.getKey();
                String fieldValue = entry.getValue();
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    try {
                        hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                        // Xử lý ký tự đặc biệt trong URL
                        if (hashData.charAt(hashData.length() - 1) == '+') {
                            hashData.setCharAt(hashData.length() - 1, ' ');
                        }
                        hashData.append('&');
                    } catch (UnsupportedEncodingException e) {
                        log.error("Lỗi mã hóa tham số: {}", e.getMessage(), e);
                    }
                }
            }
            
            // Xóa ký tự '&' cuối cùng
            if (hashData.length() > 0) {
                hashData.setLength(hashData.length() - 1);
            }
            
            // Tạo chữ ký
            String secureHash = vnPayUtils.hmacSHA512(vnPayUtils.getVnpayConfig().getHashSecret(), hashData.toString());
            
            // Tạo URL thanh toán
            String paymentUrl = vnPayUtils.getVnpayConfig().getUrl() + "?" + hashData.toString() + "&vnp_SecureHash=" + secureHash;
            
            responseData.put("test_payment_url", paymentUrl);
            responseData.put("vnp_Params", vnp_Params);
            responseData.put("test_txn_ref", vnp_Params.get("vnp_TxnRef"));
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Kiểm tra cấu hình VNPAY thành công", responseData));
        } catch (Exception e) {
            log.error("Lỗi khi tạo URL test thanh toán VNPAY: {}", e.getMessage(), e);
            responseData.put("error", e.getMessage());
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi tạo URL test thanh toán VNPAY", responseData));
        }
    }

    /**
     * Tạo URL thanh toán cho nhiều mặt hàng
     * POST /api/v1/payment/create-batch
     * 
     * Request Body:
     * {
     *   "orderId": 123,
     *   "amount": 10000,
     *   "description": "Thanh toán đơn hàng #123",
     *   "items": [
     *     {
     *       "name": "Sản phẩm A",
     *       "quantity": 2,
     *       "price": 5000
     *     }
     *   ]
     * }
     */
    @PostMapping("/create-batch")
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> createBatchPayment(
            @RequestBody PaymentRequest paymentRequest, 
            HttpServletRequest request) {
        
        log.info("Tạo URL thanh toán cho nhiều mặt hàng, đơn hàng ID: {}", paymentRequest.getOrderId());
        
        if (paymentRequest.getOrderId() == null) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "ID đơn hàng không được để trống", null)
            );
        }
        
        if (paymentRequest.getItems() == null || paymentRequest.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "Danh sách sản phẩm không được để trống", null)
            );
        }
        
        // Tính tổng tiền từ các mặt hàng nếu không có tổng trước
        if (paymentRequest.getAmount() == null || paymentRequest.getAmount() <= 0) {
            long totalAmount = paymentRequest.getItems().stream()
                .mapToLong(item -> item.getPrice() * item.getQuantity())
                .sum();
            
            paymentRequest.setAmount(totalAmount);
            log.info("Tính tổng tiền từ các mặt hàng: {}", totalAmount);
        }
        
        // Lấy địa chỉ IP người dùng
        String ipAddress = vnPayUtils.getClientIpAddress(request);
        paymentRequest.setClientIp(ipAddress);
        log.info("Địa chỉ IP của người dùng: {}", ipAddress);
        
        // Tạo mô tả chi tiết chứa thông tin sản phẩm
        if (paymentRequest.getDescription() == null || paymentRequest.getDescription().isEmpty()) {
            StringBuilder description = new StringBuilder("Thanh toan don hang #" + paymentRequest.getOrderId() + ":");
            for (PaymentRequest.Item item : paymentRequest.getItems()) {
                description.append(" ")
                    .append(item.getName())
                    .append(" x")
                    .append(item.getQuantity());
            }
            paymentRequest.setDescription(description.toString());
            log.info("Tạo mô tả tự động: {}", description);
        }
        
        // Thiết lập VNPAY làm phương thức thanh toán
        paymentRequest.setPaymentMethod("VNPAY");
        
        // Chuyển cho service xử lý
        PaymentUrlResponse paymentUrl = paymentService.processPayment(paymentRequest);
        return ResponseEntity.ok(new ApiResponse<>(
            true, 
            "Tạo URL thanh toán thành công cho " + paymentRequest.getItems().size() + " sản phẩm",
            paymentUrl
        ));
    }

    /**
     * API truy vấn kết quả giao dịch từ VNPAY (queryDr)
     * GET /api/v1/payment/query-dr?transactionId=123456
     * 
     * Tham số:
     * - transactionId: Mã giao dịch hoặc vnp_TxnRef
     */
    @GetMapping("/query-dr")
    public ResponseEntity<ApiResponse<Map<String, Object>>> queryTransactionStatus(
            @RequestParam String transactionId) {
        log.info("Truy vấn kết quả giao dịch VNPAY cho giao dịch: {}", transactionId);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. Tìm thanh toán trong hệ thống
            Optional<PaymentDTO> paymentOpt = paymentService.findPaymentByTransactionRef(transactionId);
            
            if (paymentOpt.isEmpty()) {
                log.info("Không tìm thấy giao dịch theo transaction ref, thử kiểm tra trạng thái...");
                
                try {
                    // Thử gọi checkPaymentStatus để tìm kiếm bằng các cách khác nhau
                    PaymentResponse checkResponse = paymentService.checkPaymentStatus(transactionId);
                    if (checkResponse.isSuccess()) {
                        result.put("found", true);
                        result.put("payment", checkResponse.getAdditionalInfo());
                        result.put("updated", checkResponse.getAdditionalInfo().getOrDefault("wasUpdated", false));
                        result.put("newStatus", checkResponse.getAdditionalInfo().get("status"));
                        result.put("message", checkResponse.getMessage());
                        
                        return ResponseEntity.ok(new ApiResponse<>(
                            true, 
                            "Truy vấn kết quả giao dịch thành công", 
                            result
                        ));
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi thử kiểm tra trạng thái: {}", e.getMessage());
                }
                
                result.put("found", false);
                result.put("message", "Không tìm thấy giao dịch trong hệ thống");
                return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy giao dịch", result));
            }
            
            PaymentDTO payment = paymentOpt.get();
            result.put("found", true);
            result.put("payment", payment);
            
            // 2. Kiểm tra và cập nhật trạng thái thanh toán nếu cần
            if ("VNPAY".equalsIgnoreCase(payment.getPaymentMethod()) && 
                PaymentStatus.PENDING.equals(payment.getStatus())) {
                
                log.info("Phát hiện giao dịch VNPAY đang ở trạng thái PENDING, tiến hành cập nhật...");
                
                // Gọi service để kiểm tra và cập nhật trạng thái
                PaymentResponse checkResponse = paymentService.checkPaymentStatus(payment.getTransactionId());
                result.put("updated", checkResponse.getAdditionalInfo().getOrDefault("wasUpdated", false));
                result.put("newStatus", payment.getStatus());
                
                // Sau khi cập nhật, lấy lại thông tin payment mới nhất
                paymentOpt = paymentService.findPaymentByTransactionRef(transactionId);
                if (paymentOpt.isPresent()) {
                    result.put("payment", paymentOpt.get());
                }
            }
            
            // 3. Truy vấn kết quả giao dịch từ VNPAY (chỉ áp dụng cho giao dịch VNPAY)
            if ("VNPAY".equalsIgnoreCase(payment.getPaymentMethod())) {
                try {
                    // Gọi service để truy vấn VNPAY
                    Map<String, Object> vnpayResult = paymentService.queryVnpayTransaction(transactionId);
                    result.put("vnpayResult", vnpayResult);
                    
                    // Kiểm tra kết quả truy vấn và cập nhật trạng thái nếu cần
                    if (vnpayResult.containsKey("vnp_TransactionStatus") && 
                        "00".equals(vnpayResult.get("vnp_TransactionStatus")) && 
                        payment.getStatus() != PaymentStatus.COMPLETED) {
                        
                        // Sử dụng service thay vì cập nhật đối tượng trực tiếp
                        boolean updated = paymentService.updatePaymentStatus(payment.getId(), PaymentStatus.COMPLETED, "Cập nhật trạng thái từ VNPAY API: 00 (Thành công)");
                        
                        if (updated) {
                            log.info("API đã cập nhật trạng thái thanh toán sang COMPLETED");
                            result.put("updated", true);
                            result.put("newStatus", "COMPLETED");
                            
                            // Refresh lại thông tin thanh toán mới nhất
                            paymentOpt = paymentService.findPaymentByTransactionRef(transactionId);
                            if (paymentOpt.isPresent()) {
                                result.put("payment", paymentOpt.get());
                            }
                        } else {
                            log.warn("Không thể cập nhật trạng thái thanh toán");
                            result.put("updated", false);
                            result.put("updateError", "Không thể cập nhật trạng thái thanh toán");
                        }
                    } else if (vnpayResult.containsKey("payment_updated") && (Boolean)vnpayResult.get("payment_updated")) {
                        // Nếu đã được cập nhật trong quá trình truy vấn VNPAY
                        log.info("Trạng thái thanh toán đã được cập nhật trong quá trình truy vấn VNPAY");
                        result.put("updated", true);
                        result.put("newStatus", "COMPLETED");
                        
                        // Refresh lại thông tin thanh toán mới nhất
                        paymentOpt = paymentService.findPaymentByTransactionRef(transactionId);
                        if (paymentOpt.isPresent()) {
                            result.put("payment", paymentOpt.get());
                        }
                    }
                    
                    return ResponseEntity.ok(new ApiResponse<>(
                        true, 
                        "Truy vấn kết quả giao dịch VNPAY thành công", 
                        result
                    ));
                } catch (Exception e) {
                    log.error("Lỗi khi truy vấn VNPAY: {}", e.getMessage(), e);
                    result.put("vnpayError", e.getMessage());
                    return ResponseEntity.ok(new ApiResponse<>(
                        false, 
                        "Lỗi khi truy vấn VNPAY: " + e.getMessage(), 
                        result
                    ));
                }
            }
            
            // Trả về kết quả của giao dịch không phải VNPAY
            return ResponseEntity.ok(new ApiResponse<>(
                true, 
                "Truy vấn kết quả giao dịch thành công", 
                result
            ));
        } catch (Exception e) {
            log.error("Lỗi khi truy vấn kết quả giao dịch: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
            return ResponseEntity.ok(new ApiResponse<>(
                false, 
                "Lỗi khi truy vấn kết quả giao dịch: " + e.getMessage(), 
                result
            ));
        }
    }

    /**
     * API test tạo bản ghi thanh toán mà không cần đơn hàng thật
     * GET /api/v1/payment/test-create-payment?orderId=123&amount=10000&status=PENDING
     */
    @GetMapping("/test-create-payment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testCreatePayment(
            @RequestParam(required = false, defaultValue = "999999") Integer orderId,
            @RequestParam(required = false, defaultValue = "10000") Long amount,
            @RequestParam(required = false, defaultValue = "PENDING") String status,
            Principal principal) {
        
        log.info("Tạo bản ghi thanh toán test cho đơn hàng ID: {}, trạng thái: {}", orderId, status);
        
        try {
            // Gọi service để xử lý logic
            Map<String, Object> result = paymentService.createTestPayment(orderId, amount, status);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo bản ghi thanh toán test thành công", result));
        } catch (Exception e) {
            log.error("Lỗi khi tạo bản ghi thanh toán test: {}", e.getMessage(), e);
            
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi tạo bản ghi thanh toán test", result));
        }
    }

    @GetMapping("/test-payment-direct")
    public ResponseEntity<String> testPaymentDirectUI() {
        log.info("Hiển thị trang test thanh toán trực tiếp");
        
        String html = "<html><body>"
                + "<h1>Kiểm thử thanh toán VNPAY</h1>"
                + "<form action='/api/v1/payment/test-create-vnpay' method='get'>"
                + "<div>OrderId: <input type='number' name='orderId' value='123'></div>"
                + "<div>Amount: <input type='number' name='amount' value='10000'></div>"
                + "<div>Description: <input type='text' name='description' value='Thanh toán test'></div>"
                + "<div><button type='submit'>Tạo URL thanh toán test</button></div>"
                + "</form>"
                + "</body></html>";
        
        return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
    }
    
    /**
     * Kiểm thử trạng thái VNPAY thành công trực tiếp 
     */
    @GetMapping("/test-vnpay-success")
    public ResponseEntity<String> testVnpaySuccess() {
        // Tạo HTML form để test
        String html = "<html><body>"
                + "<h1>VNPAY Test Return</h1>"
                + "<p>Đây là trang giả lập callback thành công từ VNPAY</p>"
                + "<form action='/api/v1/payment/vnpay-return' method='get'>"
                + "<input type='hidden' name='vnp_Amount' value='1000000'>"
                + "<input type='hidden' name='vnp_BankCode' value='NCB'>"
                + "<input type='hidden' name='vnp_BankTranNo' value='VNP13799756'>"
                + "<input type='hidden' name='vnp_CardType' value='ATM'>"
                + "<input type='hidden' name='vnp_OrderInfo' value='Thanh toan don hang #123'>"
                + "<input type='hidden' name='vnp_PayDate' value='20230815213843'>"
                + "<input type='hidden' name='vnp_ResponseCode' value='00'>"
                + "<input type='hidden' name='vnp_TmnCode' value='DEMOX0M1'>"
                + "<input type='hidden' name='vnp_TransactionNo' value='13799756'>"
                + "<input type='hidden' name='vnp_TransactionStatus' value='00'>"
                + "<input type='hidden' name='vnp_TxnRef' value='123456789'>"
                + "<input type='hidden' name='vnp_SecureHash' value='MOCKED_SECURE_HASH'>"
                + "<div><button type='submit'>Mô phỏng callback thành công</button></div>"
                + "</form>"
                + "</body></html>";
        
        return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
    }

    /**
     * API quản lý thanh toán - Lấy danh sách tất cả thanh toán (cho Admin)
     * GET /api/v1/payment/list
     * 
     * Tham số:
     * - page: Số trang
     * - size: Số mục mỗi trang
     * - search: Từ khóa tìm kiếm
     * - status: Trạng thái thanh toán
     * - paymentMethod: Phương thức thanh toán
     * - fromDate: Ngày bắt đầu (yyyy-MM-dd)
     * - toDate: Ngày kết thúc (yyyy-MM-dd)
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllPayments(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        log.info("Lấy danh sách thanh toán - page: {}, size: {}, search: {}, status: {}, paymentMethod: {}, fromDate: {}, toDate: {}", 
                page, size, search, status, paymentMethod, fromDate, toDate);
        
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Lấy tất cả payment từ repository
            List<Payment> payments = paymentRepository.findAll();
            
            // Logic lọc theo các tham số
            if (status != null && !status.isEmpty()) {
                payments = payments.stream()
                    .filter(p -> p.getStatus().toString().equals(status))
                    .collect(Collectors.toList());
            }
            
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                payments = payments.stream()
                    .filter(p -> p.getPaymentMethod().equals(paymentMethod))
                    .collect(Collectors.toList());
            }
            
            // Logic phân trang đơn giản
            int start = Math.min(payments.size(), page * size);
            int end = Math.min(payments.size(), (page + 1) * size);
            
            // Tạo format dữ liệu phù hợp cho response
            List<PaymentDTO> pagedPayments = payments.subList(start, end).stream()
                .map(payment -> PaymentDTO.builder()
                    .id(payment.getId())
                    .orderId(payment.getOrderId())
                    .amount(payment.getAmount())
                    .paymentMethod(payment.getPaymentMethod())
                    .status(PaymentStatus.valueOf(payment.getStatus().toString()))
                    .transactionId(payment.getTransactionId())
                    .createdAt(payment.getCreatedAt())
                    .updatedAt(payment.getUpdatedAt())
                    .description(payment.getDescription())
                    .paymentNote(payment.getPaymentNote())
                    .build())
                .collect(Collectors.toList());
            
            // Đóng gói kết quả theo format Spring Data Page
            Map<String, Object> pageResult = new HashMap<>();
            pageResult.put("content", pagedPayments);
            pageResult.put("totalElements", payments.size());
            pageResult.put("totalPages", (int) Math.ceil((double) payments.size() / size));
            pageResult.put("number", page);
            pageResult.put("size", size);
            
            result.put("data", pageResult);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thanh toán thành công", result));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách thanh toán: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi lấy danh sách thanh toán: " + e.getMessage(), null));
        }
    }

    /**
     * API quản lý thanh toán - Lấy chi tiết một thanh toán (cho Admin)
     * GET /api/v1/payment/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentById(@PathVariable Long id) {
        log.info("Lấy chi tiết thanh toán có ID: {}", id);
        
        try {
            Optional<Payment> paymentOpt = paymentRepository.findById(id);
            
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán với ID: " + id, null));
            }
            
            Payment payment = paymentOpt.get();
            PaymentDTO paymentDTO = PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(PaymentStatus.valueOf(payment.getStatus().toString()))
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .description(payment.getDescription())
                .paymentNote(payment.getPaymentNote())
                .build();
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết thanh toán thành công", paymentDTO));
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết thanh toán: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi lấy chi tiết thanh toán: " + e.getMessage(), null));
        }
    }

    /**
     * API quản lý thanh toán - Cập nhật trạng thái thanh toán (cho Admin)
     * PUT /api/v1/payment/{id}/status
     * 
     * Request Body:
     * {
     *   "status": "COMPLETED"
     * }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PaymentDTO>> updatePaymentStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        
        log.info("Cập nhật trạng thái thanh toán ID: {} thành {}", id, request.get("status"));
        
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Trạng thái không được để trống", null));
            }
            
            try {
                PaymentStatus status = PaymentStatus.valueOf(newStatus);
                
                // Sử dụng service để cập nhật trạng thái
                String note = request.get("note");
                if (note == null || note.isEmpty()) {
                    note = "Cập nhật thủ công bởi admin";
                }
                
                boolean updated = paymentService.updatePaymentStatus(id, status, note);
                
                if (!updated) {
                    return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán với ID: " + id, null));
                }
                
                // Lấy thông tin thanh toán mới nhất sau khi cập nhật
                Optional<Payment> paymentOpt = paymentRepository.findById(id);
                if (paymentOpt.isEmpty()) {
                    return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thanh toán sau khi cập nhật", null));
                }
                
                Payment payment = paymentOpt.get();
                PaymentDTO paymentDTO = PaymentDTO.builder()
                    .id(payment.getId())
                    .orderId(payment.getOrderId())
                    .amount(payment.getAmount())
                    .paymentMethod(payment.getPaymentMethod())
                    .status(payment.getStatus())
                    .transactionId(payment.getTransactionId())
                    .createdAt(payment.getCreatedAt())
                    .updatedAt(payment.getUpdatedAt())
                    .description(payment.getDescription())
                    .paymentNote(payment.getPaymentNote())
                    .build();
                
                return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái thanh toán thành công", paymentDTO));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Trạng thái không hợp lệ: " + newStatus, null));
            }
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật trạng thái thanh toán: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi cập nhật trạng thái thanh toán: " + e.getMessage(), null));
        }
    }

    /**
     * API quản lý thanh toán - Lấy thống kê thanh toán (cho Admin)
     * GET /api/v1/payment/statistics
     * 
     * Tham số:
     * - fromDate: Ngày bắt đầu (yyyy-MM-dd)
     * - toDate: Ngày kết thúc (yyyy-MM-dd)
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentStatistics(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        log.info("Lấy thống kê thanh toán - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            // Lấy tất cả payment từ repository
            List<Payment> payments = paymentRepository.findAll();
            
            // Thống kê cơ bản
            long totalCount = payments.size();
            long totalAmount = payments.stream().mapToLong(Payment::getAmount).sum();
            
            long completedCount = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .count();
            
            long pendingCount = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .count();
            
            long failedCount = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED)
                .count();
            
            long refundedCount = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.REFUNDED)
                .count();
            
            // Đóng gói kết quả
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalCount", totalCount);
            statistics.put("totalAmount", totalAmount);
            statistics.put("completedCount", completedCount);
            statistics.put("pendingCount", pendingCount);
            statistics.put("failedCount", failedCount);
            statistics.put("refundedCount", refundedCount);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê thanh toán thành công", statistics));
        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê thanh toán: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi lấy thống kê thanh toán: " + e.getMessage(), null));
        }
    }

    /**
     * API quản lý thanh toán - Xuất báo cáo thanh toán (cho Admin)
     * GET /api/v1/payment/export
     * 
     * Tham số:
     * - fromDate: Ngày bắt đầu (yyyy-MM-dd)
     * - toDate: Ngày kết thúc (yyyy-MM-dd)
     */
    @GetMapping("/export")
    public ResponseEntity<?> exportPaymentReport(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        log.info("Xuất báo cáo thanh toán - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            // Tạo mẫu dữ liệu báo cáo CSV đơn giản
            StringBuilder csvContent = new StringBuilder();
            csvContent.append("ID,OrderID,Amount,PaymentMethod,Status,TransactionID,CreatedAt,UpdatedAt\n");
            
            // Lấy tất cả payment từ repository
            List<Payment> payments = paymentRepository.findAll();
            
            // Thêm dữ liệu vào báo cáo
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            for (Payment payment : payments) {
                csvContent.append(payment.getId()).append(",");
                csvContent.append(payment.getOrderId()).append(",");
                csvContent.append(payment.getAmount()).append(",");
                csvContent.append(payment.getPaymentMethod()).append(",");
                csvContent.append(payment.getStatus()).append(",");
                csvContent.append(payment.getTransactionId()).append(",");
                csvContent.append(payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : "").append(",");
                csvContent.append(payment.getUpdatedAt() != null ? payment.getUpdatedAt().toString() : "").append("\n");
            }
            
            // Trả về file CSV
            byte[] csvBytes = csvContent.toString().getBytes(StandardCharsets.UTF_8);
            
            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payment_report.csv\"")
                .body(csvBytes);
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo thanh toán: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi xuất báo cáo thanh toán: " + e.getMessage(), null));
        }
    }

    /**
     * API quản lý thanh toán - Lấy dữ liệu thống kê cho biểu đồ (cho Admin)
     * GET /api/v1/payment/chart-data
     * 
     * Tham số:
     * - type: Loại thống kê (daily, weekly, monthly, yearly)
     * - fromDate: Ngày bắt đầu (yyyy-MM-dd)
     * - toDate: Ngày kết thúc (yyyy-MM-dd)
     * - paymentMethod: Phương thức thanh toán
     */
    @GetMapping("/chart-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChartData(
            @RequestParam(required = false, defaultValue = "monthly") String type,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String paymentMethod) {
        
        log.info("Lấy dữ liệu biểu đồ - type: {}, fromDate: {}, toDate: {}, paymentMethod: {}", 
                type, fromDate, toDate, paymentMethod);
        
        try {
            // Lấy tất cả payment từ repository
            List<Payment> payments = paymentRepository.findAll();
            
            // Lọc theo phương thức thanh toán nếu có
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                payments = payments.stream()
                    .filter(p -> p.getPaymentMethod().equals(paymentMethod))
                    .collect(Collectors.toList());
            }
            
            // Lọc theo thời gian nếu có
            if (fromDate != null && !fromDate.isEmpty()) {
                LocalDate startDate = LocalDate.parse(fromDate);
                payments = payments.stream()
                    .filter(p -> p.getCreatedAt() != null && 
                                p.getCreatedAt().toLocalDate().isEqual(startDate) || 
                                p.getCreatedAt().toLocalDate().isAfter(startDate))
                    .collect(Collectors.toList());
            }
            
            if (toDate != null && !toDate.isEmpty()) {
                LocalDate endDate = LocalDate.parse(toDate);
                payments = payments.stream()
                    .filter(p -> p.getCreatedAt() != null && 
                                p.getCreatedAt().toLocalDate().isEqual(endDate) || 
                                p.getCreatedAt().toLocalDate().isBefore(endDate))
                    .collect(Collectors.toList());
            }
            
            // Xử lý dữ liệu theo loại thống kê
            Map<String, List<Payment>> groupedData = new HashMap<>();
            List<String> labels = new ArrayList<>();
            
            switch (type) {
                case "daily":
                    // Nhóm theo ngày
                    groupedData = payments.stream()
                        .filter(p -> p.getCreatedAt() != null)
                        .collect(Collectors.groupingBy(
                            p -> p.getCreatedAt().toLocalDate().toString()
                        ));
                    
                    // Tạo nhãn cho 10 ngày gần nhất
                    LocalDate today = LocalDate.now();
                    for (int i = 9; i >= 0; i--) {
                        labels.add(today.minusDays(i).toString());
                    }
                    break;
                    
                case "weekly":
                    // Nhóm theo tuần (số tuần trong năm)
                    groupedData = payments.stream()
                        .filter(p -> p.getCreatedAt() != null)
                        .collect(Collectors.groupingBy(
                            p -> {
                                LocalDate date = p.getCreatedAt().toLocalDate();
                                return "Tuần " + date.get(java.time.temporal.WeekFields.of(Locale.getDefault()).weekOfYear()) +
                                       " - " + date.getYear();
                            }
                        ));
                    
                    // Tạo nhãn cho 8 tuần gần nhất
                    LocalDate weekDate = LocalDate.now();
                    for (int i = 7; i >= 0; i--) {
                        LocalDate weekStart = weekDate.minusWeeks(i);
                        labels.add("Tuần " + weekStart.get(java.time.temporal.WeekFields.of(Locale.getDefault()).weekOfYear()) +
                                  " - " + weekStart.getYear());
                    }
                    break;
                    
                case "yearly":
                    // Nhóm theo năm
                    groupedData = payments.stream()
                        .filter(p -> p.getCreatedAt() != null)
                        .collect(Collectors.groupingBy(
                            p -> String.valueOf(p.getCreatedAt().getYear())
                        ));
                    
                    // Tạo nhãn cho 5 năm gần nhất
                    int currentYear = LocalDate.now().getYear();
                    for (int i = 4; i >= 0; i--) {
                        labels.add(String.valueOf(currentYear - i));
                    }
                    break;
                    
                case "monthly":
                default:
                    // Nhóm theo tháng
                    groupedData = payments.stream()
                        .filter(p -> p.getCreatedAt() != null)
                        .collect(Collectors.groupingBy(
                            p -> {
                                LocalDate date = p.getCreatedAt().toLocalDate();
                                return date.getMonthValue() + "/" + date.getYear();
                            }
                        ));
                    
                    // Tạo nhãn cho 12 tháng gần nhất
                    LocalDate monthDate = LocalDate.now();
                    for (int i = 11; i >= 0; i--) {
                        LocalDate monthStart = monthDate.minusMonths(i);
                        labels.add(monthStart.getMonthValue() + "/" + monthStart.getYear());
                    }
                    break;
            }
            
            // Tính toán doanh thu và số lượng giao dịch theo thời gian
            List<Long> revenueData = new ArrayList<>();
            List<Integer> transactionData = new ArrayList<>();
            
            for (String label : labels) {
                if (groupedData.containsKey(label)) {
                    List<Payment> periodPayments = groupedData.get(label);
                    // Tính tổng doanh thu trong kỳ
                    long periodRevenue = periodPayments.stream()
                        .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                        .mapToLong(Payment::getAmount)
                        .sum();
                    revenueData.add(periodRevenue);
                    
                    // Số lượng giao dịch trong kỳ
                    transactionData.add(periodPayments.size());
                } else {
                    // Nếu không có dữ liệu cho kỳ này thì thêm giá trị 0
                    revenueData.add(0L);
                    transactionData.add(0);
                }
            }
            
            // Tính thống kê tổng
            long totalRevenue = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToLong(Payment::getAmount)
                .sum();
                
            int totalTransactions = payments.size();
            
            // Tính phân bố theo phương thức thanh toán
            Map<String, Double> paymentMethodDistribution = new HashMap<>();
            Map<String, Long> methodCounts = payments.stream()
                .collect(Collectors.groupingBy(
                    Payment::getPaymentMethod,
                    Collectors.counting()
                ));
                
            methodCounts.forEach((method, count) -> {
                paymentMethodDistribution.put(method, (double) count / totalTransactions);
            });
            
            // Tính phân bố theo trạng thái
            Map<String, Double> statusDistribution = new HashMap<>();
            Map<PaymentStatus, Long> statusCounts = payments.stream()
                .collect(Collectors.groupingBy(
                    Payment::getStatus,
                    Collectors.counting()
                ));
                
            statusCounts.forEach((status, count) -> {
                statusDistribution.put(status.toString(), (double) count / totalTransactions);
            });
            
            // Đóng gói kết quả
            Map<String, Object> result = new HashMap<>();
            result.put("labels", labels);
            result.put("revenueData", revenueData);
            result.put("transactionData", transactionData);
            result.put("totalRevenue", totalRevenue);
            result.put("totalTransactions", totalTransactions);
            result.put("paymentMethodDistribution", paymentMethodDistribution);
            result.put("statusDistribution", statusDistribution);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy dữ liệu biểu đồ thành công", result));
        } catch (Exception e) {
            log.error("Lỗi khi lấy dữ liệu biểu đồ: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi khi lấy dữ liệu biểu đồ: " + e.getMessage(), null));
        }
    }
}