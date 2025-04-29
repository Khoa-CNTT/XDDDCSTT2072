package com.agricultural.agricultural.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherDTO {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private BigDecimal discountAmount;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private String type; // "PLATFORM", "SHOP", "SHIPPING"
    private Integer shopId;
    private String shopName;
    private Integer usageLimit;
    private Integer usageCount;
    private Boolean isShippingVoucher;
    private BigDecimal shippingDiscountAmount;
    private BigDecimal minShippingFee;
} 