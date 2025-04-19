package com.agricultural.agricultural.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private boolean success;
    private String message;
    private Long orderId;
    private Long amount;
    private String paymentMethod;
    private String transactionId;
    private String redirectUrl; // thêm để redirect online payment
    private LocalDateTime timestamp;
    private Map<String, Object> additionalInfo; // Thêm thông tin bổ sung
}
