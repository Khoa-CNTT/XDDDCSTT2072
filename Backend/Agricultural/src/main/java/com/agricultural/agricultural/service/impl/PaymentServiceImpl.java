package com.agricultural.agricultural.service.impl;
import com.agricultural.agricultural.config.VNPAYConfig;
import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.request.RefundRequest;
import com.agricultural.agricultural.dto.response.PaymentDTO;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.dto.response.PaymentUrlResponse;
import com.agricultural.agricultural.dto.response.PaymentQRDTO;
import com.agricultural.agricultural.dto.response.PaymentViewResponse;
import com.agricultural.agricultural.entity.Order;
import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.IOrderRepository;
import com.agricultural.agricultural.repository.IPaymentRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IPaymentService;
import com.agricultural.agricultural.utils.VNPayUtils;
import com.agricultural.agricultural.utils.QRCodeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import com.agricultural.agricultural.service.INotificationService;
import com.agricultural.agricultural.dto.NotificationDTO;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final IOrderRepository orderRepository;
    private final IPaymentRepository paymentRepository;
    private final IUserRepository userRepository;
    private final VNPAYConfig vnPayConfig;
    private final VNPayUtils vnPayUtils;
    private final QRCodeUtils qrCodeUtils;
    private final INotificationService notificationService;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendBaseUrl;

    @Override
    @Transactional
    public PaymentUrlResponse processPayment(PaymentRequest paymentRequest) {
        if (paymentRequest.getOrderId() == null || paymentRequest.getAmount() == null) {
            throw new BadRequestException("OrderId và amount không được để trống");
        }

        String paymentMethod = paymentRequest.getPaymentMethod();
        if (paymentMethod == null) {
            throw new BadRequestException("Phương thức thanh toán không được để trống");
        }

        try {
            if ("VNPAY".equalsIgnoreCase(paymentMethod)) {
                return createVnpayPaymentUrl(paymentRequest);
            } else {
                Integer currentUserId = getCurrentUserId();
                if (currentUserId == null) {
                    throw new BadRequestException("Người dùng chưa đăng nhập");
                }

                Payment payment = new Payment();
                payment.setOrderId(Math.toIntExact(paymentRequest.getOrderId()));
                payment.setAmount(paymentRequest.getAmount());
                payment.setPaymentMethod(paymentMethod);
                payment.setDescription(paymentRequest.getDescription());
                payment.setStatus(PaymentStatus.PENDING);
                payment.setTransactionId(UUID.randomUUID().toString());
                payment.setPaymentId("PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8));
                payment.setUserId(currentUserId);

                payment = paymentRepository.save(payment);

                PaymentUrlResponse response = new PaymentUrlResponse();
                response.setOrderId(Math.toIntExact(paymentRequest.getOrderId()));
                response.setAmount(paymentRequest.getAmount());
                response.setTransactionId(payment.getTransactionId());
                response.setPaymentUrl(backendBaseUrl + "/api/v1/payment/check-return?transactionId=" + payment.getTransactionId());

                return response;
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý thanh toán: ", e);
            throw new BadRequestException("Không thể xử lý thanh toán lúc này, vui lòng thử lại sau");
        }
    }

    @Override
    public Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            try {
                if (authentication.getPrincipal() instanceof User) {
                    User user = (User) authentication.getPrincipal();
                    return user.getId();
                }

                String username = authentication.getName();
                Optional<User> userOpt = userRepository.findByUserName(username);
                return userOpt.map(User::getId).orElse(null);
            } catch (Exception e) {
                log.error("Lỗi khi lấy ID người dùng hiện tại: {}", e.getMessage());
                return null;
            }
        }
        return null;
    }

    private PaymentUrlResponse createVnpayPaymentUrl(PaymentRequest paymentRequest) {
        log.info("=== BẮT ĐẦU TẠO URL THANH TOÁN VNPAY ===");
        log.info("Tạo URL thanh toán VNPAY cho đơn hàng: {}", paymentRequest.getOrderId());
        log.info("Cấu hình VNPAY - TMN Code: {}, HashSecret: {}", vnPayConfig.getTmnCode(), vnPayConfig.getHashSecret());

        Order order = orderRepository.findById(Math.toIntExact(paymentRequest.getOrderId()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + paymentRequest.getOrderId()));

        Long amount = paymentRequest.getAmount() != null ? paymentRequest.getAmount() : order.getTotalAmount().longValue();
        String description = paymentRequest.getDescription();
        if (description == null || description.isEmpty()) {
            description = "Thanh toán đơn hàng #" + paymentRequest.getOrderId();
        }

        Integer currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            currentUserId = order.getBuyerId();
        }

        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setAmount(amount);
        payment.setPaymentMethod("VNPAY");
        payment.setDescription(description);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaymentId("PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8));
        payment.setUserId(currentUserId);

        payment = paymentRepository.save(payment);
        log.info("Đã tạo bản ghi Payment: orderId={}, amount={}, transactionId={}, paymentId={}", 
                 payment.getOrderId(), payment.getAmount(), payment.getTransactionId(), payment.getPaymentId());

        String returnUrl = backendBaseUrl + "/api/v1/payment/vnpay-return";
        String ipAddress = paymentRequest.getClientIp() != null ? paymentRequest.getClientIp() : "127.0.0.1";

        // Tạo URL thanh toán với VNPAY
        log.info("Tạo URL thanh toán VNPAY với returnUrl: {}, ipAddress: {}", returnUrl, ipAddress);
        String paymentUrl = vnPayUtils.createPaymentUrl(
                order.getId().longValue(),
                amount,
                description,
                returnUrl,
                ipAddress
        );
        
        // Trích xuất vnp_TxnRef từ URL tạo ra để lưu vào payment
        try {
            // URL có dạng: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...&vnp_TxnRef=44177281&...
            String vnp_TxnRef = null;
            if (paymentUrl.contains("vnp_TxnRef=")) {
                int startIdx = paymentUrl.indexOf("vnp_TxnRef=") + "vnp_TxnRef=".length();
                int endIdx = paymentUrl.indexOf("&", startIdx);
                if (endIdx == -1) endIdx = paymentUrl.length();
                vnp_TxnRef = paymentUrl.substring(startIdx, endIdx);
            }
            
            if (vnp_TxnRef != null) {
                log.info("Đã trích xuất vnp_TxnRef từ URL: {}", vnp_TxnRef);
                
                // Cập nhật thông tin vnp_TxnRef vào trường payment_note của Payment
                payment.setPaymentNote("vnp_TxnRef=" + vnp_TxnRef);
                paymentRepository.save(payment);
                log.info("Đã cập nhật vnp_TxnRef vào Payment note: {}", vnp_TxnRef);
            }
        } catch (Exception e) {
            // Bắt lỗi nhưng không dừng lại flow
            log.error("Lỗi khi trích xuất vnp_TxnRef: {}", e.getMessage());
        }
        
        log.info("URL thanh toán VNPAY đã được tạo: {}", paymentUrl);
        log.info("=== KẾT THÚC TẠO URL THANH TOÁN VNPAY ===");

        PaymentUrlResponse response = new PaymentUrlResponse();
        response.setOrderId((int) order.getId().longValue());
        response.setAmount(amount);
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentUrl(paymentUrl);

        return response;
    }


    @Override
    @Transactional
    public PaymentResponse processRefund(RefundRequest refundRequest) {
        log.info("=== BẮT ĐẦU XỬ LÝ HOÀN TIỀN ===");
        log.info("Yêu cầu hoàn tiền: transactionId={}, amount={}", refundRequest.getTransactionId(), refundRequest.getAmount());
        
        // Kiểm tra yêu cầu hoàn tiền
        if (refundRequest.getTransactionId() == null || refundRequest.getAmount() == null) {
            throw new BadRequestException("TransactionId và amount không được để trống");
        }
        
        // Tìm payment dựa trên transactionId
        Payment payment = paymentRepository.findByTransactionId(refundRequest.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch với ID: " + refundRequest.getTransactionId()));
        
        // Kiểm tra trạng thái thanh toán
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            log.error("Không thể hoàn tiền cho giao dịch chưa hoàn tất: {}", payment.getTransactionId());
            throw new BadRequestException("Không thể hoàn tiền cho giao dịch chưa hoàn tất");
        }
        
        // Kiểm tra số tiền hoàn
        if (refundRequest.getAmount() > payment.getAmount()) {
            log.error("Số tiền hoàn ({}) vượt quá số tiền giao dịch ban đầu ({})", 
                      refundRequest.getAmount(), payment.getAmount());
            throw new BadRequestException("Số tiền hoàn không thể vượt quá số tiền giao dịch ban đầu");
        }
        
        // Xử lý hoàn tiền tùy thuộc vào phương thức thanh toán
        boolean refundSuccess = false;
        String refundMessage = "";
        
        try {
            if ("VNPAY".equals(payment.getPaymentMethod())) {
                // Triển khai API hoàn tiền VNPAY ở đây nếu có
                // Hiện tại chỉ cập nhật trạng thái hoàn tiền
                refundSuccess = true;
                refundMessage = "Hoàn tiền thành công qua VNPAY";
                
                // Cập nhật trạng thái payment
                payment.setStatus(PaymentStatus.REFUNDED);
                payment.setPaymentNote(payment.getPaymentNote() + " | Refunded: " + refundRequest.getAmount() + " at " + LocalDateTime.now());
                paymentRepository.save(payment);
                
                // Cập nhật trạng thái đơn hàng
                Order order = orderRepository.findById(payment.getOrderId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + payment.getOrderId()));
                order.setStatus(OrderStatus.REFUNDED);
                orderRepository.save(order);
                
                log.info("Hoàn tiền thành công: transactionId={}, amount={}", payment.getTransactionId(), refundRequest.getAmount());
            } else {
                // Xử lý hoàn tiền cho các phương thức thanh toán khác
                refundSuccess = true;
                refundMessage = "Hoàn tiền thành công qua " + payment.getPaymentMethod();
                
                // Cập nhật trạng thái payment
                payment.setStatus(PaymentStatus.REFUNDED);
                payment.setPaymentNote(payment.getPaymentNote() + " | Refunded: " + refundRequest.getAmount() + " at " + LocalDateTime.now());
                paymentRepository.save(payment);
                
                // Cập nhật trạng thái đơn hàng
                Order order = orderRepository.findById(payment.getOrderId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + payment.getOrderId()));
                order.setStatus(OrderStatus.REFUNDED);
                orderRepository.save(order);
                
                log.info("Hoàn tiền thành công: transactionId={}, amount={}", payment.getTransactionId(), refundRequest.getAmount());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý hoàn tiền: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể xử lý hoàn tiền: " + e.getMessage());
        }
        
        log.info("=== KẾT THÚC XỬ LÝ HOÀN TIỀN ===");
        
        return PaymentResponse.builder()
                .success(refundSuccess)
                .message(refundMessage)
                .transactionId(refundRequest.getTransactionId())
                .amount(refundRequest.getAmount())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public Optional<PaymentDTO> getPaymentHistory(Long orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderIdOrderByCreatedAtDesc(Math.toIntExact(orderId));
        return paymentOpt.map(PaymentDTO::fromEntity);
    }

    /**
     * Lấy tất cả lịch sử thanh toán của một đơn hàng
     *
     * @param orderId ID đơn hàng
     * @return Danh sách các giao dịch thanh toán
     */
    @Override
    public List<PaymentDTO> getAllPaymentHistoryByOrderId(Long orderId) {
        log.info("Lấy tất cả lịch sử thanh toán cho đơn hàng: {}", orderId);
        
        // Kiểm tra đơn hàng tồn tại
        Order order = orderRepository.findById(Math.toIntExact(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        
        // Lấy danh sách các giao dịch thanh toán
        List<Payment> payments = paymentRepository.findAllByOrderIdOrderByCreatedAtDesc(Math.toIntExact(orderId));
        
        log.info("Tìm thấy {} giao dịch thanh toán cho đơn hàng {}", payments.size(), orderId);
        return PaymentDTO.fromEntities(payments);
    }

    @Override
    public PaymentResponse checkPaymentStatus(String transactionId) {
        log.info("=== BẮT ĐẦU KIỂM TRA TRẠNG THÁI THANH TOÁN ===");
        log.info("Kiểm tra trạng thái thanh toán cho giao dịch: {}", transactionId);
        
        try {
            Payment payment = paymentRepository.findByTransactionId(transactionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch với ID: " + transactionId));
            
            log.info("Giao dịch [{}]: phương thức={}, trạng thái={}, số tiền={}", 
                     transactionId, payment.getPaymentMethod(), payment.getStatus(), payment.getAmount());
            
            // Lấy thông tin đơn hàng
            Order order = orderRepository.findById(payment.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + payment.getOrderId()));
            
            Map<String, Object> additionalInfo = new HashMap<>();
            additionalInfo.put("orderId", order.getId());
            additionalInfo.put("orderStatus", order.getStatus());
            additionalInfo.put("paymentId", payment.getPaymentId());
            additionalInfo.put("createdAt", payment.getCreatedAt());
            
            if (payment.getPaymentNote() != null) {
                additionalInfo.put("paymentNote", payment.getPaymentNote());
            }
            
            if (payment.getTransactionReference() != null) {
                additionalInfo.put("transactionReference", payment.getTransactionReference());
            }
            
            log.info("=== KẾT THÚC KIỂM TRA TRẠNG THÁI THANH TOÁN ===");

            return PaymentResponse.builder()
                    .success(payment.getStatus() == PaymentStatus.COMPLETED)
                    .message("Trạng thái thanh toán: " + payment.getStatus().name())
                    .transactionId(transactionId)
                    .paymentMethod(payment.getPaymentMethod())
                    .amount(payment.getAmount())
                    .timestamp(LocalDateTime.now())
                    .additionalInfo(additionalInfo)
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra trạng thái thanh toán: {}", e.getMessage());
            throw new BadRequestException("Không thể kiểm tra trạng thái thanh toán: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentResponse processVnpayReturn(Map<String, String> vnpParams) {
        log.info("=== BẮT ĐẦU XỬ LÝ CALLBACK TỪ VNPAY ===");
        log.info("Tham số callback VNPAY: {}", vnpParams);
        log.info("Secure Hash từ VNPAY: {}", vnpParams.get("vnp_SecureHash"));
        
        boolean isValidSignature = vnPayUtils.validateVnpayCallback(vnpParams);
        log.info("Kết quả xác thực chữ ký: {}", isValidSignature ? "HỢP LỆ" : "KHÔNG HỢP LỆ");
        
        if (!isValidSignature) {
            log.error("Chữ ký không hợp lệ từ VNPAY callback");
            throw new BadRequestException("Chữ ký không hợp lệ");
        }

        String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
        String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
        String vnp_TransactionNo = vnpParams.get("vnp_TransactionNo");
        log.info("Mã phản hồi: {}, Mã giao dịch: {}, Số giao dịch: {}", 
                 vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo);

        if (vnp_TxnRef == null || vnp_ResponseCode == null) {
            throw new BadRequestException("Thiếu thông tin giao dịch");
        }

        // Trích xuất orderId từ vnp_TxnRef - theo mẫu {orderId}{random6digits}
        Integer orderId = null;
        try {
            // Xử lý an toàn hơn để trích xuất orderId
            // Cách 1: Nếu vnp_TxnRef theo định dạng [orderId][random6digits]
            if (vnp_TxnRef.length() > 6) {
                String orderId_str = vnp_TxnRef.substring(0, vnp_TxnRef.length() - 6);
                log.info("Cố gắng trích xuất orderId từ vnp_TxnRef: [{}] -> [{}]", vnp_TxnRef, orderId_str);
                try {
                    orderId = Integer.parseInt(orderId_str);
                    log.info("Đã trích xuất orderId = {} từ vnp_TxnRef", orderId);
                } catch (NumberFormatException e) {
                    log.error("Không thể chuyển đổi orderId_str thành số: {}", orderId_str);
                }
            }
            
            // Cách 2: Nếu Cách 1 thất bại, thử tìm trong paymentNote của các payment gần đây
            if (orderId == null) {
                log.info("Tìm orderId từ payment note với vnp_TxnRef = {}", vnp_TxnRef);
                try {
                    Optional<Payment> paymentOpt = findPaymentByNoteKeywordSafe("vnp_TxnRef=" + vnp_TxnRef);
                    if (paymentOpt.isPresent()) {
                        orderId = paymentOpt.get().getOrderId();
                        log.info("Đã tìm thấy orderId = {} từ payment note", orderId);
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi tìm payment theo note: {}", e.getMessage());
                    // Nếu có nhiều bản ghi, thử sử dụng trực tiếp từ vnp_TxnRef
                    if (vnp_TxnRef.length() > 6) {
                        try {
                            String orderIdStr = vnp_TxnRef.substring(0, vnp_TxnRef.length() - 6);
                            orderId = Integer.parseInt(orderIdStr);
                            log.info("Đã trích xuất orderId = {} từ vnp_TxnRef sau khi xử lý lỗi", orderId);
                        } catch (NumberFormatException nfe) {
                            log.error("Không thể chuyển đổi orderId từ vnp_TxnRef sau khi xử lý lỗi");
                        }
                    }
                }
            }
            
            // Cách 3: Nếu Cách 1 và 2 thất bại, thử tìm trong vnp_OrderInfo
            if (orderId == null && vnpParams.containsKey("vnp_OrderInfo")) {
                String orderInfo = vnpParams.get("vnp_OrderInfo");
                log.info("Tìm orderId từ vnp_OrderInfo: {}", orderInfo);
                // Thường vnp_OrderInfo có dạng "Thanh toan don hang #123"
                if (orderInfo != null && orderInfo.contains("#")) {
                    String[] parts = orderInfo.split("#");
                    if (parts.length > 1) {
                        String orderIdPart = parts[1].trim();
                        // Lấy chỉ phần số
                        String digits = orderIdPart.replaceAll("\\D+", "");
                        if (!digits.isEmpty()) {
                            try {
                                orderId = Integer.parseInt(digits);
                                log.info("Đã trích xuất orderId = {} từ vnp_OrderInfo", orderId);
                            } catch (NumberFormatException e) {
                                log.error("Không thể chuyển đổi phần số từ vnp_OrderInfo thành orderId: {}", digits);
                            }
                        }
                    }
                }
            }
            
            // Nếu vẫn không tìm được orderId
            if (orderId == null) {
                log.error("Không thể xác định orderId từ tham số VNPAY: {}", vnpParams);
                throw new BadRequestException("Không thể xác định mã đơn hàng từ vnp_TxnRef");
            }
        } catch (Exception e) {
            log.error("Lỗi khi trích xuất orderId từ vnp_TxnRef: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể xác định mã đơn hàng");
        }
        
        // Lưu orderId vào biến final để sử dụng trong lambda
        final Integer finalOrderId = orderId;
        Order order = orderRepository.findById(finalOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + finalOrderId));

        Optional<Payment> paymentOpt = paymentRepository.findByOrderIdOrderByCreatedAtDesc(finalOrderId);
        if (paymentOpt.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy thanh toán cho đơn hàng: " + finalOrderId);
        }

        Payment payment = paymentOpt.get();
        boolean isSuccess = "00".equals(vnp_ResponseCode);
        PaymentStatus paymentStatus = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
        log.info("Cập nhật trạng thái thanh toán: {} - {}", paymentStatus, isSuccess ? "Thành công" : "Thất bại");

        payment.setStatus(paymentStatus);
        if (vnp_TransactionNo != null) {
            payment.setTransactionReference(vnp_TransactionNo);
        }
        
        // Lưu thêm thông tin giao dịch vào paymentNote
        String existingNote = payment.getPaymentNote() != null ? payment.getPaymentNote() : "";
        payment.setPaymentNote(existingNote + " | Return: vnp_TxnRef=" + vnp_TxnRef + 
            ", vnp_TransactionNo=" + vnp_TransactionNo + ", vnp_ResponseCode=" + vnp_ResponseCode);

        paymentRepository.save(payment);

        if (isSuccess) {
            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(order);
            log.info("Cập nhật trạng thái đơn hàng thành PROCESSING");
            
            // Gửi thông báo thanh toán thành công
            try {
                handlePaymentCallback(finalOrderId, true);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo thanh toán thành công: {}", e.getMessage());
            }
        } else {
            // Gửi thông báo thanh toán thất bại
            try {
                handlePaymentCallback(finalOrderId, false);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo thanh toán thất bại: {}", e.getMessage());
            }
        }
        
        log.info("=== KẾT THÚC XỬ LÝ CALLBACK TỪ VNPAY ===");

        return PaymentResponse.builder()
                .success(isSuccess)
                .message(isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại")
                .transactionId(payment.getTransactionId())
                .paymentMethod("VNPAY")
                .amount(payment.getAmount())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse processVnpayIpn(Map<String, String> vnpParams) {
        log.info("=== BẮT ĐẦU XỬ LÝ IPN TỪ VNPAY ===");
        log.info("Tham số IPN VNPAY: {}", vnpParams);
        log.info("Secure Hash từ VNPAY: {}", vnpParams.get("vnp_SecureHash"));

        try {
            // Kiểm tra xem có phải là request test không
            boolean isTestRequest = false;
            if (vnpParams.containsKey("user_id")) {
                log.info("Phát hiện request test IPN với user_id: {}", vnpParams.get("user_id"));
                isTestRequest = true;
            }
            
            boolean isValidSignature = vnPayUtils.validateVnpayCallback(vnpParams);
            log.info("Kết quả xác thực chữ ký IPN: {}", isValidSignature ? "HỢP LỆ" : "KHÔNG HỢP LỆ");
            
            // Bỏ qua kiểm tra chữ ký cho API test
            if (!isValidSignature && !isTestRequest) {
                log.error("Chữ ký không hợp lệ từ VNPAY IPN");
                throw new BadRequestException("Chữ ký không hợp lệ");
            } else if (!isValidSignature && isTestRequest) {
                log.warn("Bỏ qua kiểm tra chữ ký cho request test IPN");
            }

            String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
            String vnp_TransactionNo = vnpParams.get("vnp_TransactionNo");
            log.info("Mã phản hồi IPN: {}, Mã giao dịch: {}, Số giao dịch: {}", 
                     vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo);

            if (vnp_TxnRef == null || vnp_ResponseCode == null) {
                throw new BadRequestException("Thiếu thông tin giao dịch");
            }

            // Trích xuất orderId từ vnp_TxnRef - theo mẫu {orderId}{random6digits}
            Integer orderId = null;
            try {
                // Xử lý an toàn hơn để trích xuất orderId
                // Cách 1: Nếu vnp_TxnRef theo định dạng [orderId][random6digits]
                if (vnp_TxnRef.length() > 6) {
                    String orderId_str = vnp_TxnRef.substring(0, vnp_TxnRef.length() - 6);
                    log.info("Cố gắng trích xuất orderId từ vnp_TxnRef: [{}] -> [{}]", vnp_TxnRef, orderId_str);
                    try {
                        orderId = Integer.parseInt(orderId_str);
                        log.info("Đã trích xuất orderId = {} từ vnp_TxnRef", orderId);
                    } catch (NumberFormatException e) {
                        log.error("Không thể chuyển đổi orderId_str thành số: {}", orderId_str);
                    }
                }
                
                // Cách 2: Nếu Cách 1 thất bại, thử tìm trong paymentNote của các payment gần đây
                if (orderId == null) {
                    log.info("Tìm orderId từ payment note với vnp_TxnRef = {}", vnp_TxnRef);
                    try {
                        Optional<Payment> paymentOpt = findPaymentByNoteKeywordSafe("vnp_TxnRef=" + vnp_TxnRef);
                        if (paymentOpt.isPresent()) {
                            orderId = paymentOpt.get().getOrderId();
                            log.info("Đã tìm thấy orderId = {} từ payment note", orderId);
                        }
                    } catch (Exception e) {
                        log.error("Lỗi khi tìm payment theo note: {}", e.getMessage());
                        // Nếu có nhiều bản ghi, thử sử dụng trực tiếp từ vnp_TxnRef
                        if (vnp_TxnRef.length() > 6) {
                            try {
                                String orderIdStr = vnp_TxnRef.substring(0, vnp_TxnRef.length() - 6);
                                orderId = Integer.parseInt(orderIdStr);
                                log.info("Đã trích xuất orderId = {} từ vnp_TxnRef sau khi xử lý lỗi", orderId);
                            } catch (NumberFormatException nfe) {
                                log.error("Không thể chuyển đổi orderId từ vnp_TxnRef sau khi xử lý lỗi");
                            }
                        }
                    }
                }
                
                // Cách 3: Nếu Cách 1 và 2 thất bại, thử tìm trong vnp_OrderInfo
                if (orderId == null && vnpParams.containsKey("vnp_OrderInfo")) {
                    String orderInfo = vnpParams.get("vnp_OrderInfo");
                    log.info("Tìm orderId từ vnp_OrderInfo: {}", orderInfo);
                    // Thường vnp_OrderInfo có dạng "Thanh toan don hang #123"
                    if (orderInfo != null && orderInfo.contains("#")) {
                        String[] parts = orderInfo.split("#");
                        if (parts.length > 1) {
                            String orderIdPart = parts[1].trim();
                            // Lấy chỉ phần số
                            String digits = orderIdPart.replaceAll("\\D+", "");
                            if (!digits.isEmpty()) {
                                try {
                                    orderId = Integer.parseInt(digits);
                                    log.info("Đã trích xuất orderId = {} từ vnp_OrderInfo", orderId);
                                } catch (NumberFormatException e) {
                                    log.error("Không thể chuyển đổi phần số từ vnp_OrderInfo thành orderId: {}", digits);
                                }
                            }
                        }
                    }
                }
                
                // Nếu vẫn không tìm được orderId
                if (orderId == null) {
                    log.error("Không thể xác định orderId từ tham số VNPAY: {}", vnpParams);
                    throw new BadRequestException("Không thể xác định mã đơn hàng từ vnp_TxnRef");
                }
            } catch (Exception e) {
                log.error("Lỗi khi trích xuất orderId từ vnp_TxnRef: {}", e.getMessage(), e);
                throw new BadRequestException("Không thể xác định mã đơn hàng");
            }

            // Lưu orderId vào biến final để sử dụng trong lambda
            final Integer finalOrderId = orderId;
            Order order = orderRepository.findById(finalOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + finalOrderId));

            Optional<Payment> paymentOpt = paymentRepository.findByOrderIdOrderByCreatedAtDesc(finalOrderId);
            if (paymentOpt.isEmpty()) {
                throw new ResourceNotFoundException("Không tìm thấy thanh toán cho đơn hàng: " + finalOrderId);
            }

            Payment payment = paymentOpt.get();
            boolean isSuccess = "00".equals(vnp_ResponseCode);
            PaymentStatus paymentStatus = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
            log.info("Cập nhật trạng thái thanh toán IPN: {} - {}", paymentStatus, isSuccess ? "Thành công" : "Thất bại");

            payment.setStatus(paymentStatus);
            if (vnp_TransactionNo != null) {
                payment.setTransactionReference(vnp_TransactionNo);
            }
            
            // Lưu thêm thông tin giao dịch vào paymentNote
            String existingNote = payment.getPaymentNote() != null ? payment.getPaymentNote() : "";
            payment.setPaymentNote(existingNote + " | IPN: vnp_TxnRef=" + vnp_TxnRef + 
                ", vnp_TransactionNo=" + vnp_TransactionNo + ", vnp_ResponseCode=" + vnp_ResponseCode);

            paymentRepository.save(payment);

            if (isSuccess) {
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.save(order);
                log.info("Cập nhật trạng thái đơn hàng IPN thành PROCESSING");
                
                // Gửi thông báo thanh toán thành công
                try {
                    handlePaymentCallback(finalOrderId, true);
                } catch (Exception e) {
                    log.error("Lỗi khi gửi thông báo thanh toán thành công: {}", e.getMessage());
                }
            } else {
                // Gửi thông báo thanh toán thất bại
                try {
                    handlePaymentCallback(finalOrderId, false);
                } catch (Exception e) {
                    log.error("Lỗi khi gửi thông báo thanh toán thất bại: {}", e.getMessage());
                }
            }
            
            log.info("=== KẾT THÚC XỬ LÝ IPN TỪ VNPAY ===");

            return PaymentResponse.builder()
                    .success(isSuccess)
                    .message("IPN xử lý thành công")
                    .transactionId(payment.getTransactionId())
                    .paymentMethod("VNPAY")
                    .amount(payment.getAmount())
                    .timestamp(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi xử lý IPN từ VNPAY: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi khi xử lý IPN: " + e.getMessage());
        }
    }

    /**
     * Tạo thông tin thanh toán QR cho VNPAY
     * @param paymentRequest Yêu cầu thanh toán
     * @return PaymentQRDTO chứa thông tin QR và thông tin thanh toán
     */
    @Override
    public PaymentQRDTO createPaymentQRCode(PaymentRequest paymentRequest) {
        log.info("Tạo mã QR thanh toán cho đơn hàng ID: {}", paymentRequest.getOrderId());
        
        try {
            // Validate input
            if (paymentRequest.getOrderId() == null) {
                throw new BadRequestException("Order ID is required");
            }
            if (paymentRequest.getAmount() == null || paymentRequest.getAmount() <= 0) {
                throw new BadRequestException("Amount must be greater than 0");
            }
            
            // Lưu orderId vào biến final để sử dụng trong lambda
            final Long finalOrderId = paymentRequest.getOrderId();
            Order order = orderRepository.findById(Math.toIntExact(finalOrderId))
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            
            // Lấy thông tin người dùng hiện tại
            Integer currentUserId = getCurrentUserId();
            if (currentUserId == null) {
                // Nếu không có người dùng hiện tại, thử lấy từ order
                currentUserId = order.getBuyerId();
                
                // Nếu vẫn không có, báo lỗi
                if (currentUserId == null) {
                    throw new BadRequestException("Không thể xác định người dùng thực hiện thanh toán");
                }
            }
            
            // Create a payment record
            Payment payment = new Payment();
            payment.setOrderId(order.getId());
            payment.setAmount(paymentRequest.getAmount());
            payment.setDescription(paymentRequest.getDescription());
            payment.setPaymentMethod("VNPAY");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId(UUID.randomUUID().toString());
            payment.setUserId(currentUserId); // Thiết lập userId
            payment.setPaymentId("PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8));
            payment = paymentRepository.save(payment);
            
            // Chuẩn bị thông tin
            String returnUrl = paymentRequest.getReturnUrl() != null ? 
                    paymentRequest.getReturnUrl() : backendBaseUrl + "/api/v1/payment/vnpay-return";
            String ipAddress = paymentRequest.getClientIp() != null ? 
                    paymentRequest.getClientIp() : "127.0.0.1";
            
            // Generate payment URL
            String paymentUrl = vnPayUtils.createPaymentUrl(
                    Long.valueOf(order.getId()),
                    paymentRequest.getAmount(),
                    paymentRequest.getDescription(),
                    returnUrl,
                    ipAddress
            );
            
            // Generate QR code from payment URL
            String qrCodeBase64 = qrCodeUtils.generateQRCode(paymentUrl);
            
            // Create response DTO
            PaymentQRDTO responseDTO = PaymentQRDTO.builder()
                    .qrCodeBase64(qrCodeBase64)
                    .paymentUrl(paymentUrl)
                    .orderInfo(paymentRequest.getDescription())
                    .amount(Double.valueOf(paymentRequest.getAmount()))
                    .transactionRef(payment.getTransactionId())
                    .expireTime(LocalDateTime.now().plusMinutes(15))
                    .build();
            
            log.info("Mã QR thanh toán được tạo thành công cho giao dịch: {}", payment.getTransactionId());
            return responseDTO;
            
        } catch (Exception e) {
            log.error("Lỗi khi tạo mã QR thanh toán: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public Page<PaymentViewResponse> getPaymentHistory(Integer pageNo, Integer pageSize, Long userId) {
        // Triển khai sau khi đã định nghĩa class PaymentViewResponse
        throw new UnsupportedOperationException("Method not implemented yet");
    }

    @Override
    public PaymentResponse processVNPayReturn(Map<String, String> params) {
        // Chuyển hướng về phương thức processVnpayReturn
        return processVnpayReturn(params);
    }
    
    @Override
    public PaymentResponse processVNPayIPN(Map<String, String> params) {
        // Chuyển hướng về phương thức processVnpayIpn
        return processVnpayIpn(params);
    }

    @Override
    public void handlePaymentCallback(Integer orderId, boolean paymentSuccessful) {
        // Sử dụng final để đảm bảo an toàn khi sử dụng trong lambda expression
        final Integer finalOrderId = orderId;
        Order order = orderRepository.findById(finalOrderId).orElse(null);

        if (order != null) {
            String title = paymentSuccessful ? "Thanh toán thành công" : "Thanh toán thất bại";
            String message = paymentSuccessful
                ? "Đơn hàng #" + order.getOrderNumber() + " đã được thanh toán thành công"
                : "Thanh toán cho đơn hàng #" + order.getOrderNumber() + " không thành công. Vui lòng thử lại";

            NotificationDTO notification = NotificationDTO.builder()
                    .userId(order.getBuyerId())
                    .title(title)
                    .message(message)
                    .type("PAYMENT_STATUS")
                    .redirectUrl("/orders/" + order.getId())
                    .build();

            notificationService.sendRealTimeNotification(notification);
        }
    }

    @Override
    public Optional<PaymentDTO> findPaymentByTransactionRef(String transactionRef) {
        log.info("Tìm thanh toán theo mã giao dịch: {}", transactionRef);
        
        // Thử tìm theo transactionId
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(transactionRef);
        if (paymentOpt.isPresent()) {
            log.info("Tìm thấy thanh toán theo transactionId");
            return paymentOpt.map(PaymentDTO::fromEntity);
        }
        
        // Thử tìm theo transactionReference (vnp_TransactionNo)
        paymentOpt = paymentRepository.findByTransactionReference(transactionRef);
        if (paymentOpt.isPresent()) {
            log.info("Tìm thấy thanh toán theo transactionReference");
            return paymentOpt.map(PaymentDTO::fromEntity);
        }
        
        // Thử tìm theo paymentNote (có thể chứa vnp_TxnRef)
        try {
            Optional<Payment> paymentByNote = findPaymentByNoteKeywordSafe("vnp_TxnRef=" + transactionRef);
            if (paymentByNote.isPresent()) {
                log.info("Tìm thấy thanh toán theo paymentNote");
                return Optional.of(PaymentDTO.fromEntity(paymentByNote.get()));
            }
        } catch (Exception e) {
            log.error("Lỗi khi tìm payment theo note: {}", e.getMessage());
            // Nếu lỗi, thử tìm bằng cách khác
            List<Payment> recentPayments = paymentRepository.findAllByPaymentNoteKeyword(transactionRef);
            if (!recentPayments.isEmpty()) {
                log.info("Tìm thấy thanh toán theo paymentNote sau khi xử lý lỗi");
                return Optional.of(PaymentDTO.fromEntity(recentPayments.get(0)));
            }
        }
        
        log.info("Không tìm thấy thanh toán với mã giao dịch: {}", transactionRef);
        return Optional.empty();
    }
    
    @Override
    public Map<String, Object> queryVnpayTransaction(String transactionRef) {
        log.info("Truy vấn kết quả giao dịch VNPAY: {}", transactionRef);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Tạo tham số truy vấn
            Map<String, String> queryParams = new HashMap<>();
            
            // Các tham số bắt buộc
            queryParams.put("vnp_Version", vnPayConfig.getVersion());
            queryParams.put("vnp_Command", "querydr");
            queryParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            queryParams.put("vnp_TxnRef", transactionRef);
            queryParams.put("vnp_OrderInfo", "Truy van giao dich " + transactionRef);
            queryParams.put("vnp_TransDate", vnPayUtils.getCurrentDateTime());
            queryParams.put("vnp_CreateDate", vnPayUtils.getCurrentDateTime());
            queryParams.put("vnp_IpAddr", "127.0.0.1");
            
            // Tạo chuỗi hash data và chữ ký
            StringBuilder hashData = new StringBuilder();
            for (Map.Entry<String, String> entry : queryParams.entrySet()) {
                if ((entry.getValue() != null) && (entry.getValue().length() > 0)) {
                    try {
                        hashData.append(entry.getKey())
                              .append('=')
                              .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()))
                              .append('&');
                    } catch (UnsupportedEncodingException e) {
                        log.error("Lỗi khi mã hóa tham số: {}", e.getMessage(), e);
                    }
                }
            }
            
            // Xóa ký tự '&' cuối cùng
            if (hashData.length() > 0) {
                hashData.setLength(hashData.length() - 1);
            }
            
            // Tạo chữ ký
            String secureHash = vnPayUtils.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryParams.put("vnp_SecureHash", secureHash);
            
            // Gọi API VNPAY
            // Đoạn code này chỉ là giả lập vì không thực sự gọi API
            // Trong môi trường thực tế, bạn sẽ sử dụng HttpClient, RestTemplate hoặc WebClient
            // để gọi API của VNPAY
            
            // Mô phỏng kết quả truy vấn
            result.put("queryParams", queryParams);
            result.put("status", "00");  // 00: Thành công
            result.put("message", "Giao dịch thành công");
            result.put("amount", 10000);
            result.put("transactionNo", "12345678");
            
            log.info("Kết quả truy vấn VNPAY: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi truy vấn VNPAY: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
            return result;
        }
    }

    @Override
    public Map<String, Object> createTestPayment(Integer orderId, Long amount, String status) {
        log.info("Service: Tạo bản ghi thanh toán test cho đơn hàng ID: {}, trạng thái: {}", orderId, status);
        
        try {
            // Lấy ID người dùng từ context hoặc sử dụng giá trị mặc định
            Integer userId = 1; // Mặc định là 1 nếu không lấy được
            
            Integer currentUserId = getCurrentUserId();
            if (currentUserId != null) {
                userId = currentUserId;
                log.info("Đã lấy userId từ người dùng đang đăng nhập: {}", userId);
            } else {
                log.warn("Không lấy được userId từ context, sử dụng giá trị mặc định: {}", userId);
            }
            
            // Tạo bản ghi payment trực tiếp mà không kiểm tra đơn hàng
            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setAmount(amount);
            payment.setPaymentMethod("VNPAY");
            payment.setDescription("Thanh toán test cho đơn hàng #" + orderId);
            
            // Xác định trạng thái
            PaymentStatus paymentStatus;
            try {
                paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Trạng thái không hợp lệ: {}, sử dụng PENDING", status);
                paymentStatus = PaymentStatus.PENDING;
            }
            payment.setStatus(paymentStatus);
            
            // Tạo các ID
            String transactionId = "TEST_" + System.currentTimeMillis();
            payment.setTransactionId(transactionId);
            payment.setPaymentId("PAY" + System.currentTimeMillis());
            payment.setTransactionReference("VNP" + System.currentTimeMillis());
            
            // Thiết lập thông tin khác 
            payment.setUserId(userId);
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setPaymentNote("Thanh toán test | vnp_TxnRef=" + transactionId);
            
            // Lưu vào database
            Payment savedPayment = paymentRepository.save(payment);
            
            // Tạo kết quả
            Map<String, Object> result = new HashMap<>();
            result.put("payment_id", savedPayment.getId());
            result.put("transaction_id", savedPayment.getTransactionId());
            result.put("order_id", savedPayment.getOrderId());
            result.put("amount", savedPayment.getAmount());
            result.put("status", savedPayment.getStatus());
            result.put("created_at", savedPayment.getCreatedAt());
            result.put("user_id", savedPayment.getUserId());
            
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi tạo bản ghi thanh toán test: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể tạo bản ghi thanh toán test: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> createTestVnpayUrl(Long orderId, Long amount, String description, String ipAddress) {
        log.info("Service: Tạo URL thanh toán VNPAY test cho đơn hàng ID: {}, số tiền: {}", orderId, amount);
        
        try {
            // Lấy ID người dùng từ context hoặc sử dụng giá trị mặc định
            Integer userId = 1; // Mặc định là 1 nếu không lấy được
            
            Integer currentUserId = getCurrentUserId();
            if (currentUserId != null) {
                userId = currentUserId;
                log.info("Đã lấy userId từ người dùng đang đăng nhập: {}", userId);
            } else {
                log.warn("Không lấy được userId từ context, sử dụng giá trị mặc định: {}", userId);
            }
            
            // Tạo tham số truy vấn
            Map<String, String> vnp_Params = new TreeMap<>();
            vnp_Params.put("vnp_Version", vnPayConfig.getVersion());
            vnp_Params.put("vnp_Command", vnPayConfig.getCommand());
            vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // Nhân 100 theo yêu cầu của VNPAY
            vnp_Params.put("vnp_CurrCode", "VND");
            
            // Tạo mã giao dịch duy nhất
            String txnRef = String.valueOf(orderId) + getRandomNumber(6);
            vnp_Params.put("vnp_TxnRef", txnRef);
            
            // Thông tin đơn hàng
            vnp_Params.put("vnp_OrderInfo", description + " #" + orderId);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            
            // Lấy IP của client
            if (ipAddress == null || ipAddress.isEmpty()) {
                ipAddress = "127.0.0.1";
            }
            vnp_Params.put("vnp_IpAddr", ipAddress);
            
            // Thời gian tạo giao dịch
            String createDate = vnPayUtils.getCurrentDateTime();
            vnp_Params.put("vnp_CreateDate", createDate);
            
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
            String secureHash = vnPayUtils.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            
            // Tạo URL thanh toán
            String paymentUrl = vnPayConfig.getUrl() + "?" + hashData.toString() + "&vnp_SecureHash=" + secureHash;
            
            // Tạo bản ghi payment trực tiếp
            Payment payment = new Payment();
            payment.setOrderId(orderId.intValue());
            payment.setAmount(amount);
            payment.setPaymentMethod("VNPAY");
            payment.setDescription(description + " #" + orderId);
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("VNPAY_" + System.currentTimeMillis());
            payment.setPaymentId("PAY" + System.currentTimeMillis());
            payment.setPaymentNote("Thanh toán test | vnp_TxnRef=" + txnRef);
            payment.setUserId(userId);
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            
            Payment savedPayment = paymentRepository.save(payment);
            
            // Tạo response
            Map<String, Object> result = new HashMap<>();
            result.put("payment_url", paymentUrl);
            result.put("order_id", orderId);
            result.put("amount", amount);
            result.put("txn_ref", txnRef);
            result.put("vnp_params", vnp_Params);
            result.put("payment_id", savedPayment.getId());
            result.put("user_id", savedPayment.getUserId());
            
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi tạo URL thanh toán VNPAY test: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể tạo URL thanh toán VNPAY test: " + e.getMessage());
        }
    }
    
    // Phương thức hỗ trợ tạo số ngẫu nhiên cho vnp_TxnRef
    private String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public Map<String, Object> simulateVnpayIpn(Map<String, String> params) {
        log.info("Service: Mô phỏng IPN từ VNPAY với params: {}", params);
        
        // Tạo các tham số cần thiết nếu chưa có
        if (!params.containsKey("vnp_TxnRef")) {
            throw new BadRequestException("Thiếu thông số vnp_TxnRef");
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
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode()); // Sử dụng TMN Code từ cấu hình
        params.put("vnp_Version", "2.1.0");
        
        try {
            // Lấy ID người dùng từ context hoặc sử dụng giá trị mặc định
            Integer userId = 1; // Mặc định là 1 nếu không lấy được
            
            Integer currentUserId = getCurrentUserId();
            if (currentUserId != null) {
                userId = currentUserId;
                log.info("Đã lấy userId từ người dùng đang đăng nhập: {}", userId);
            } else {
                log.warn("Không lấy được userId từ context, sử dụng giá trị mặc định: {}", userId);
            }
            
            // Thêm user_id vào params để đánh dấu là request test
            params.put("user_id", userId.toString());
            
            // Tạo chữ ký cho request IPN
            Map<String, String> vnpParams = new TreeMap<>(params);
            
            // Xóa chữ ký cũ nếu có
            vnpParams.remove("vnp_SecureHash");
            vnpParams.remove("vnp_SecureHashType");
            
            // Tạo chuỗi hash data
            StringBuilder hashData = new StringBuilder();
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
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
            
            // Tạo chữ ký mới
            String secureHash = vnPayUtils.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            params.put("vnp_SecureHash", secureHash);
            
            log.info("Đã tạo chữ ký mới cho IPN: {}", secureHash);
            log.info("Tham số IPN cuối cùng: {}", params);
            
            // Gọi service để xử lý giống như IPN thật
            PaymentResponse ipnResponse = processVnpayIpn(params);
            
            // Tạo kết quả
            Map<String, Object> result = new HashMap<>();
            result.put("success", ipnResponse.isSuccess());
            result.put("message", ipnResponse.getMessage());
            result.put("params", params);
            result.put("user_id", userId);
            
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi mô phỏng IPN: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi khi mô phỏng IPN: " + e.getMessage());
        }
    }

    /**
     * Tìm payment dựa trên từ khóa trong paymentNote một cách an toàn
     * Sử dụng SQL native query để tránh lỗi "Query did not return a unique result"
     * 
     * @param keyword Từ khóa cần tìm
     * @return Optional<Payment> Bản ghi payment tìm thấy (mới nhất) hoặc Optional.empty()
     */
    private Optional<Payment> findPaymentByNoteKeywordSafe(String keyword) {
        log.debug("Tìm payment an toàn theo keyword: {}", keyword);
        try {
            // Sử dụng SQL native query với LIMIT 1 để luôn trả về tối đa một kết quả
            return paymentRepository.findLatestByPaymentNoteKeyword(keyword);
        } catch (Exception e) {
            log.error("Lỗi khi tìm payment theo note với keyword [{}]: {}", keyword, e.getMessage());
            
            // Trong trường hợp lỗi, thử tìm thủ công
            try {
                // Lấy tất cả payment có chứa keyword
                List<Payment> matchingPayments = paymentRepository.findAllByPaymentNoteKeyword(keyword);
                
                if (!matchingPayments.isEmpty()) {
                    // Sắp xếp theo thời gian giảm dần và lấy bản ghi đầu tiên
                    matchingPayments.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
                    log.debug("Tìm thấy {} payment khớp keyword, lấy bản ghi mới nhất", matchingPayments.size());
                    return Optional.of(matchingPayments.get(0));
                }
            } catch (Exception ex) {
                log.error("Không thể thực hiện tìm kiếm thủ công: {}", ex.getMessage());
            }
            
            return Optional.empty();
        }
    }
}

