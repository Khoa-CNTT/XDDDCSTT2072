package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "discount_percentage", nullable = false)
    private BigDecimal discountPercentage;

    @Column(name = "max_discount")
    private BigDecimal maxDiscount;

    @Column(name = "min_order_value", nullable = false)
    private BigDecimal minOrderValue;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CouponStatus status;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private CouponType type;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "usage_count")
    private Integer usageCount;

    @Column(name = "user_specific")
    private Boolean userSpecific;

    @Column(name = "specific_user_id")
    private Integer specificUserId;

    @Column(name = "category_specific")
    private Boolean categorySpecific;

    @Column(name = "specific_category_id")
    private Integer specificCategoryId;

    @Column(name = "product_specific")
    private Boolean productSpecific;

    @Column(name = "specific_product_id")
    private Integer specificProductId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum CouponStatus {
        active, expired, disabled
    }

    public enum CouponType {
        PERCENTAGE, FIXED, FREE_SHIPPING
    }

    // Phương thức kiểm tra coupon có hợp lệ không
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return status == CouponStatus.active && 
               now.isAfter(startDate) && 
               now.isBefore(endDate) && 
               (usageLimit == null || usageCount < usageLimit);
    }

    // Phương thức tính toán số tiền giảm giá
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        // Kiểm tra giá trị đơn hàng có đạt tối thiểu không
        if (orderAmount.compareTo(minOrderValue) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        
        if (type == CouponType.PERCENTAGE) {
            // Giảm giá theo phần trăm
            discount = orderAmount.multiply(discountPercentage.divide(new BigDecimal(100)));
            
            // Kiểm tra giới hạn giảm giá tối đa
            if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
                discount = maxDiscount;
            }
        } else if (type == CouponType.FIXED) {
            // Giảm giá cố định
            discount = maxDiscount;
            
            // Kiểm tra không vượt quá giá trị đơn hàng
            if (discount.compareTo(orderAmount) > 0) {
                discount = orderAmount;
            }
        } else {
            // FREE_SHIPPING: Sẽ xử lý riêng trong service
            discount = BigDecimal.ZERO;
        }
        
        return discount;
    }
    
    // Tăng số lần sử dụng khi áp dụng coupon
    public void incrementUsage() {
        if (usageCount == null) {
            usageCount = 0;
        }
        usageCount++;
    }
} 