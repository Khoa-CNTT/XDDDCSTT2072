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

import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import org.springframework.data.domain.Page;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IPaymentService {

    PaymentUrlResponse processPayment(PaymentRequest paymentRequest);


    PaymentResponse processRefund(RefundRequest refundRequest);


    Optional<PaymentDTO> getPaymentHistory(Long orderId);


    List<PaymentDTO> getAllPaymentHistoryByOrderId(Long orderId);


    PaymentResponse checkPaymentStatus(String transactionId);


    PaymentResponse processVnpayReturn(Map<String, String> vnpParams);


    PaymentResponse processVnpayIpn(Map<String, String> vnpParams);


    Page<PaymentViewResponse> getPaymentHistory(Integer pageNo, Integer pageSize, Long userId);
    

    PaymentResponse processVNPayReturn(Map<String, String> params);
    

    PaymentResponse processVNPayIPN(Map<String, String> params);
    

    PaymentQRDTO createPaymentQRCode(PaymentRequest paymentRequest);

    void handlePaymentCallback(Integer orderId, boolean paymentSuccessful);


    Optional<PaymentDTO> findPaymentByTransactionRef(String transactionRef);
    

    Map<String, Object> queryVnpayTransaction(String transactionRef);
    

    Integer getCurrentUserId();
    

    Map<String, Object> createTestPayment(Integer orderId, Long amount, String status);
    

    Map<String, Object> createTestVnpayUrl(Long orderId, Long amount, String description, String ipAddress);
    

    Map<String, Object> simulateVnpayIpn(Map<String, String> params);

    boolean updatePaymentStatus(Long paymentId, PaymentStatus newStatus, String note);

}