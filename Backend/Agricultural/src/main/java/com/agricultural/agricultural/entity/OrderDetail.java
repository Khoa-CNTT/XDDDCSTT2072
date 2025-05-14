package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @Column(name = "product_id", nullable = false)
    private Integer productId;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "product_image")
    private String productImage;
    
    @Column(name = "variant_id")
    private Integer variantId;
    
    @Column(name = "variant_name")
    private String variantName;
    
    @Column(name = "shop_id")
    private Integer shopId;
    
    @Column(name = "shop_name")
    private String shopName;
    
    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "voucher_code")
    private String voucherCode;
    
    @Column(name = "voucher_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal voucherDiscount = BigDecimal.ZERO;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "review_status")
    @Builder.Default
    private ReviewStatus reviewStatus = ReviewStatus.NOT_REVIEWED;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private MarketPlace product;
    
    @ManyToOne
    @JoinColumn(name = "variant_id", insertable = false, updatable = false)
    private ProductVariant variant;
    
    @PrePersist
    @PreUpdate
    public void calculateTotalPrice() {
        if (this.price == null) {
            this.price = BigDecimal.ZERO;
        }
        
        if (this.quantity == null) {
            this.quantity = 0;
        }
        
        if (this.discountAmount == null) {
            this.discountAmount = BigDecimal.ZERO;
        }
        
        if (this.voucherDiscount == null) {
            this.voucherDiscount = BigDecimal.ZERO;
        }
        
        BigDecimal finalPrice = this.price.subtract(this.discountAmount).subtract(this.voucherDiscount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }
        
        this.totalPrice = finalPrice.multiply(new BigDecimal(this.quantity));
    }
} 