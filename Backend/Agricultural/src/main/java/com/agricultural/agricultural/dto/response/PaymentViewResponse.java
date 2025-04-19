package com.agricultural.agricultural.dto.response;

import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentViewResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long amount;
    private String paymentMethod;
    private PaymentStatus status;
    private String transactionId;
    private String paymentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String description;

    public static PaymentViewResponse fromEntity(Payment payment) {
        if (payment == null) {
            return null;
        }
        
        PaymentViewResponse response = PaymentViewResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId() != null ? Long.valueOf(payment.getOrderId()) : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paymentId(payment.getPaymentId())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .description(payment.getDescription())
                .build();
        
        if (payment.getOrder() != null) {
            response.setOrderNumber(payment.getOrder().getOrderNumber());
        }
        
        return response;
    }
} 