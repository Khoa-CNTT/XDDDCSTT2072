package com.agricultural.agricultural.dto.response;

import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Integer orderId;
    private Integer userId;
    private Long amount;
    private String paymentMethod;
    private PaymentStatus status;
    private String paymentId;
    private String transactionId;
    private String transactionReference;
    private String paymentNote;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Basic user info
    private String userName;
    private String userEmail;
    
    // Basic order info
    private String orderNumber;
    
    public static PaymentDTO fromEntity(Payment payment) {
        if (payment == null) {
            return null;
        }
        
        PaymentDTO dto = PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paymentId(payment.getPaymentId())
                .transactionId(payment.getTransactionId())
                .transactionReference(payment.getTransactionReference())
                .paymentNote(payment.getPaymentNote())
                .description(payment.getDescription())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
        
        // Add order data if available
        if (payment.getOrder() != null) {
            dto.setOrderNumber(payment.getOrder().getOrderNumber());
        }
        
        // Add user data if available
        if (payment.getUser() != null) {
            dto.setUserName(payment.getUser().getUsername());
            dto.setUserEmail(payment.getUser().getEmail());
        }
        
        return dto;
    }
    
    public static List<PaymentDTO> fromEntities(List<Payment> payments) {
        if (payments == null) {
            return List.of();
        }
        
        return payments.stream()
                .map(PaymentDTO::fromEntity)
                .collect(Collectors.toList());
    }
} 