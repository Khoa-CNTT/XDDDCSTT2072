package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "code", nullable = false, unique = true)
    private String code;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "type", nullable = false)
    private String type; // "PLATFORM", "SHOP", "SHIPPING"
    
    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;
    
    @Column(name = "discount_percent")
    private Integer discountPercent;
    
    @Column(name = "min_order_amount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount;
    
    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;
    
    @Column(name = "is_shipping_voucher")
    @Builder.Default
    private Boolean isShippingVoucher = false;
    
    @Column(name = "shipping_discount_amount", precision = 10, scale = 2)
    private BigDecimal shippingDiscountAmount;
    
    @Column(name = "min_shipping_fee", precision = 10, scale = 2)
    private BigDecimal minShippingFee;
    
    @Column(name = "shop_id")
    private Integer shopId;
    
    @Column(name = "shop_name")
    private String shopName;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Column(name = "usage_limit")
    private Integer usageLimit;
    
    @Column(name = "usage_count")
    @Builder.Default
    private Integer usageCount = 0;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Phương thức kiểm tra voucher có hợp lệ không
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && 
               now.isAfter(startDate) && 
               now.isBefore(endDate) && 
               (usageLimit == null || usageCount < usageLimit);
    }
    
    // Phương thức tính toán giá trị giảm giá
    public BigDecimal calculateDiscount(BigDecimal orderAmount, BigDecimal shippingFee) {
        if (!isValid() || orderAmount == null) {
            return BigDecimal.ZERO;
        }
        
        // Kiểm tra điều kiện đơn hàng tối thiểu
        if (minOrderAmount != null && orderAmount.compareTo(minOrderAmount) < 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal discount = BigDecimal.ZERO;
        
        // Tính giảm giá cho đơn hàng
        if (!Boolean.TRUE.equals(isShippingVoucher)) {
            if (discountAmount != null) {
                discount = discountAmount;
            } else if (discountPercent != null) {
                discount = orderAmount.multiply(new BigDecimal(discountPercent).divide(new BigDecimal(100)));
                
                // Kiểm tra giới hạn giảm giá tối đa
                if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                    discount = maxDiscountAmount;
                }
            }
        }
        // Tính giảm giá cho phí vận chuyển
        else if (shippingFee != null) {
            if (minShippingFee != null && shippingFee.compareTo(minShippingFee) < 0) {
                return BigDecimal.ZERO;
            }
            
            if (shippingDiscountAmount != null) {
                // Không giảm nhiều hơn phí vận chuyển
                discount = shippingDiscountAmount.min(shippingFee);
            }
        }
        
        return discount;
    }
    
    // Cập nhật số lần sử dụng
    public void incrementUsageCount() {
        if (usageCount == null) {
            usageCount = 0;
        }
        usageCount++;
        
        // Kiểm tra và cập nhật trạng thái nếu đã đạt giới hạn
        if (usageLimit != null && usageCount >= usageLimit) {
            isActive = false;
        }
    }
} 