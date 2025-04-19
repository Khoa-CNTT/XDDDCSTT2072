package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.request.RefundRequest;
import com.agricultural.agricultural.dto.response.PaymentDTO;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.dto.response.PaymentUrlResponse;
import com.agricultural.agricultural.entity.Payment;

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
} 