package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.request.RefundRequest;
import com.agricultural.agricultural.dto.response.PaymentDTO;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.dto.response.PaymentUrlResponse;
import com.agricultural.agricultural.dto.response.PaymentQRDTO;
import com.agricultural.agricultural.dto.response.PaymentViewResponse;
import com.agricultural.agricultural.dto.response.PaymentStatusResponse;
import com.agricultural.agricultural.entity.Payment;

import org.springframework.data.domain.Page;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IPaymentService {
    /**
     * Xử lý yêu cầu thanh toán
     *
     * @param paymentRequest Thông tin thanh toán
     * @return Đường dẫn thanh toán
     */
    PaymentUrlResponse processPayment(PaymentRequest paymentRequest);

    /**
     * Xử lý hoàn tiền
     *
     * @param refundRequest Thông tin hoàn tiền
     * @return Kết quả hoàn tiền
     */
    PaymentResponse processRefund(RefundRequest refundRequest);

    /**
     * Lấy lịch sử thanh toán của đơn hàng
     *
     * @param orderId ID đơn hàng
     * @return Thanh toán gần nhất
     */
    Optional<PaymentDTO> getPaymentHistory(Long orderId);

    /**
     * Lấy tất cả lịch sử thanh toán của một đơn hàng
     *
     * @param orderId ID đơn hàng
     * @return Danh sách các giao dịch thanh toán
     */
    List<PaymentDTO> getAllPaymentHistoryByOrderId(Long orderId);

    /**
     * Kiểm tra trạng thái thanh toán
     *
     * @param transactionId ID giao dịch
     * @return Kết quả kiểm tra
     */
    PaymentResponse checkPaymentStatus(String transactionId);

    /**
     * Xử lý callback từ VNPAY
     *
     * @param vnpParams Tham số từ VNPAY
     * @return Kết quả xử lý
     */
    PaymentResponse processVnpayReturn(Map<String, String> vnpParams);

    /**
     * Xử lý IPN (Instant Payment Notification) từ VNPAY
     *
     * @param vnpParams Tham số từ VNPAY
     * @return Kết quả xử lý
     */
    PaymentResponse processVnpayIpn(Map<String, String> vnpParams);

    /**
     * Lấy lịch sử thanh toán theo trang
     * 
     * @param pageNo Số trang
     * @param pageSize Kích thước trang
     * @param userId ID người dùng
     * @return Trang kết quả thanh toán
     */
    Page<PaymentViewResponse> getPaymentHistory(Integer pageNo, Integer pageSize, Long userId);
    
    /**
     * Xử lý callback từ VNPAY (tên thay thế)
     * @param params Tham số từ VNPAY
     * @return Kết quả xử lý
     */
    PaymentResponse processVNPayReturn(Map<String, String> params);
    
    /**
     * Xử lý IPN từ VNPAY (tên thay thế)
     * @param params Tham số từ VNPAY
     * @return Kết quả xử lý
     */
    PaymentResponse processVNPayIPN(Map<String, String> params);
    
    /**
     * Tạo mã QR thanh toán
     * 
     * @param paymentRequest Yêu cầu thanh toán
     * @return Thông tin mã QR thanh toán
     */
    PaymentQRDTO createPaymentQRCode(PaymentRequest paymentRequest);

    void handlePaymentCallback(Integer orderId, boolean paymentSuccessful);
} 