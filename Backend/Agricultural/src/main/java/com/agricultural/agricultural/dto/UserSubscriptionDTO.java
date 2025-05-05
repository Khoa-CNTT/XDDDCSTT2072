package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionDTO {
    private Long id;
    
    @NotNull(message = "ID người dùng không được để trống")
    private Integer userId;
    
    @NotNull(message = "ID gói đăng ký không được để trống")
    private Integer planId;
    
    private String planName;
    
    private Integer maxLocations;
    
    private Integer locationsUsed;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private BigDecimal paymentAmount;
    
    private String paymentStatus;
    
    private String transactionId;
    
    private Boolean isActive;
    
    private Boolean isAutoRenew;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Thông tin bổ sung
    private String userName;
    
    private String userEmail;
    
    // Tính toán
    private Integer remainingLocations;
    
    private Long daysRemaining;
    
    private Boolean isExpired;
} 