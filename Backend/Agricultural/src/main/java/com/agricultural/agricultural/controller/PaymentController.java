package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.request.RefundRequest;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.dto.response.PaymentDTO;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.dto.response.PaymentUrlResponse;
import com.agricultural.agricultural.dto.response.PaymentQRDTO;
import com.agricultural.agricultural.service.IPaymentService;
import com.agricultural.agricultural.utils.VNPayUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import com.agricultural.agricultural.service.impl.MomoPaymentService;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final IPaymentService paymentService;
    private final VNPayUtils vnPayUtils;
    private final ObjectMapper objectMapper;
    private final MomoPaymentService momoPaymentService;

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
     */
    @GetMapping("/test-create-vnpay")
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> testCreateVnpayPayment(
            @RequestParam Long orderId,
            @RequestParam Long amount,
            @RequestParam(required = false, defaultValue = "Thanh toán đơn hàng") String description,
            HttpServletRequest request) {
        
        log.info("Test tạo URL thanh toán VNPAY cho đơn hàng ID: {}, số tiền: {}", orderId, amount);
        
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(orderId);
        paymentRequest.setAmount(amount);
        paymentRequest.setPaymentMethod("VNPAY");
        paymentRequest.setDescription(description + " #" + orderId);
        
        // Lấy địa chỉ IP của người dùng
        String ipAddress = vnPayUtils.getClientIpAddress(request);
        paymentRequest.setClientIp(ipAddress);
        log.info("Địa chỉ IP của người dùng cho VNPAY: {}", ipAddress);
        
        PaymentUrlResponse paymentUrl = paymentService.processPayment(paymentRequest);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo URL thanh toán VNPAY thành công", paymentUrl));
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
        log.info("Kiểm tra trạng thái thanh toán cho giao dịch: {}", transactionId);
        PaymentResponse response = paymentService.checkPaymentStatus(transactionId);
        return ResponseEntity.ok(new ApiResponse<>(response.isSuccess(), response.getMessage(), response));
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
            log.info("Nhận callback từ VNPAY Return URL");
            
            // Xử lý trường hợp URL không đúng định dạng với tham số sau &
            String requestURI = request.getRequestURI();
            String queryString = request.getQueryString();
            
            log.info("Request URI: {}, Query String: {}", requestURI, queryString);
            
            Map<String, String> vnpParams = new HashMap<>();
            
            if (requestURI.contains("&vnp_")) {
                // URL không đúng định dạng, có dạng: /vnpay-return&vnp_param1=value1&vnp_param2=value2
                log.info("URL không đúng định dạng, trích xuất tham số từ URI: {}", requestURI);
                
                String paramsSection = requestURI.substring(requestURI.indexOf("&") + 1);
                String[] paramPairs = paramsSection.split("&");
                
                for (String pair : paramPairs) {
                    if (pair.contains("=")) {
                        String[] keyValue = pair.split("=", 2);
                        vnpParams.put(keyValue[0], keyValue[1]);
                    }
                }
                
                log.info("Đã trích xuất tham số từ URI: {}", vnpParams);
            } else if (queryString != null && !queryString.isEmpty()) {
                // URL đúng định dạng với query string: ?param1=value1&param2=value2
                log.info("Trích xuất tham số từ query string: {}", queryString);
                
                String[] paramPairs = queryString.split("&");
                for (String pair : paramPairs) {
                    if (pair.contains("=")) {
                        String[] keyValue = pair.split("=", 2);
                        vnpParams.put(keyValue[0], URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8));
                    }
                }
            } else {
                // URL đúng định dạng, lấy tham số từ request parameters
                Enumeration<String> params = request.getParameterNames();
                while (params.hasMoreElements()) {
                    String param = params.nextElement();
                    String value = request.getParameter(param);
                    vnpParams.put(param, value);
                }
            }
            
            log.info("VNPAY Return Params: {}", vnpParams);
            
            PaymentResponse response = paymentService.processVnpayReturn(vnpParams);
            
            // Tạo trang HTML để hiển thị kết quả và chuyển hướng người dùng
            StringBuilder htmlBuilder = new StringBuilder();
            htmlBuilder.append("<!DOCTYPE html>");
            htmlBuilder.append("<html>");
            htmlBuilder.append("<head>");
            htmlBuilder.append("<meta charset=\"UTF-8\">");
            htmlBuilder.append("<title>").append(response.isSuccess() ? "Thanh toán thành công" : "Thanh toán thất bại").append("</title>");
            htmlBuilder.append("<style>");
            htmlBuilder.append("body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }");
            htmlBuilder.append(".success { color: green; }");
            htmlBuilder.append(".failure { color: red; }");
            htmlBuilder.append("button { padding: 10px 20px; margin-top: 20px; cursor: pointer; }");
            htmlBuilder.append("</style>");
            htmlBuilder.append("</head>");
            htmlBuilder.append("<body>");
            
            if (response.isSuccess()) {
                htmlBuilder.append("<h1 class=\"success\">Thanh toán thành công</h1>");
                htmlBuilder.append("<p>Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.</p>");
                htmlBuilder.append("<p>Mã giao dịch: ").append(response.getTransactionId()).append("</p>");
                htmlBuilder.append("<p>Số tiền: ").append(response.getAmount()).append(" VNĐ</p>");
            } else {
                htmlBuilder.append("<h1 class=\"failure\">Thanh toán thất bại</h1>");
                htmlBuilder.append("<p>").append(response.getMessage()).append("</p>");
            }
            
            htmlBuilder.append("<button onclick=\"window.location.href='/'\">Quay lại trang chủ</button>");
            htmlBuilder.append("</body>");
            htmlBuilder.append("</html>");
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(htmlBuilder.toString());
        } catch (Exception e) {
            log.error("Lỗi khi xử lý callback từ VNPAY: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null
            ));
        }
    }
    
    /**
     * VNPAY IPN URL - Xử lý IPN (Instant Payment Notification) từ VNPAY
     * IPN được gọi tự động từ VNPAY để cập nhật trạng thái thanh toán
     */
    @PostMapping("/vnpay-ipn")
    public ResponseEntity<?> handleVnpayIpn(HttpServletRequest request) {
        try {
            Map<String, String> vnpParams = new HashMap<>();
            Enumeration<String> params = request.getParameterNames();
            while (params.hasMoreElements()) {
                String param = params.nextElement();
                String value = request.getParameter(param);
                vnpParams.put(param, value);
            }
            
            log.info("VNPAY IPN Params: {}", vnpParams);
            
            PaymentResponse response = paymentService.processVnpayIpn(vnpParams);
            
            // VNPAY IPN yêu cầu format phản hồi đặc biệt
            Map<String, String> ipnResponse = new HashMap<>();
            ipnResponse.put("RspCode", "00");
            ipnResponse.put("Message", "Confirmed");
            
            return ResponseEntity.ok(ipnResponse);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý IPN từ VNPAY: {}", e.getMessage());
            
            // Trả về lỗi theo định dạng yêu cầu của VNPAY
            Map<String, String> ipnResponse = new HashMap<>();
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
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulateVnpayIpn(@RequestBody Map<String, String> params) {
        log.info("Mô phỏng IPN từ VNPAY với params: {}", params);
        
        // Tạo các tham số cần thiết nếu chưa có
        if (!params.containsKey("vnp_TxnRef")) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Thiếu thông số vnp_TxnRef", null));
        }
        
        if (!params.containsKey("vnp_ResponseCode")) {
            params.put("vnp_ResponseCode", "00"); // Mặc định là thành công
        }
        
        if (!params.containsKey("vnp_TransactionNo")) {
            params.put("vnp_TransactionNo", String.valueOf(System.currentTimeMillis()));
        }
        
        if (!params.containsKey("vnp_Amount")) {
            params.put("vnp_Amount", "1000000"); // 10,000 VND (đã nhân 100)
        }
        
        // Tạo thêm các tham số cần thiết khác
        params.put("vnp_Command", "pay");
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", "Thanh toan don hang #" + params.get("vnp_TxnRef"));
        params.put("vnp_OrderType", "other");
        params.put("vnp_TmnCode", "YOUR_TMN_CODE"); // Sử dụng TMN Code từ cấu hình
        params.put("vnp_Version", "2.1.0");
        
        try {
            // Gọi service để xử lý giống như IPN thật
            paymentService.processVnpayIpn(params);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã mô phỏng thành công IPN từ VNPAY");
            result.put("params", params);
            
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

}