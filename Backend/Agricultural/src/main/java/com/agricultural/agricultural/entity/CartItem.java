package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @Column(name = "shop_id")
    private Integer shopId;

    @Column(name = "shop_name")
    private String shopName;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private MarketPlace product;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column
    private String notes;

    @Column(name = "is_selected")
    @Builder.Default
    private Boolean isSelected = false;

    @CreationTimestamp
    @Column(name = "added_at")
    private LocalDateTime addedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper method để tính toán giá tổng
    @PrePersist
    @PreUpdate
    public void calculatePrices() {
        // Tính đơn giá
        if (variant != null && variant.getFinalPrice() != null) {
            this.unitPrice = variant.getFinalPrice();
        } else if (product != null && product.getCurrentPrice() != null) {
            this.unitPrice = product.getCurrentPrice();
        } else {
            this.unitPrice = BigDecimal.ZERO;
        }

        // Tính tổng giá sau khi trừ khuyến mãi
        if (this.unitPrice != null && this.quantity != null) {
            if (this.discountAmount == null) {
                this.discountAmount = BigDecimal.ZERO;
            }
            BigDecimal finalPrice = this.unitPrice.subtract(this.discountAmount);
            this.totalPrice = finalPrice.multiply(new BigDecimal(this.quantity));
        } else {
            this.totalPrice = BigDecimal.ZERO;
        }
        
        // Cập nhật thông tin shop từ sản phẩm nếu chưa có
        if (this.shopId == null && product != null && product.getUser() != null) {
            this.shopId = product.getUser().getId();
            if (product.getUser().getUsername() != null) {
                this.shopName = product.getUser().getUsername();
            }
        }
    }
}
