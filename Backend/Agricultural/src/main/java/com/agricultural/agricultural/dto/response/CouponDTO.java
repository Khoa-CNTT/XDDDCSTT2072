package com.agricultural.agricultural.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDTO {
    private Integer id;
    private String code;
    private String type;
    private BigDecimal discountPercentage;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private Integer usageLimit;
    private Integer usageCount;
    private Boolean userSpecific;
    private Integer specificUserId;
    private Boolean categorySpecific;
    private Integer specificCategoryId;
    private Boolean productSpecific;
    private Integer specificProductId;
    private LocalDateTime createdAt;
    
    // Trường mở rộng
    private Boolean isValid;
    private Boolean isExpired;
    private Long daysLeft; // Số ngày còn lại trước khi hết hạn
} 