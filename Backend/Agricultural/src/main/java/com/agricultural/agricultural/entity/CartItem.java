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


    @Column
    private String notes;

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

        // Tính tổng giá
        if (this.unitPrice != null && this.quantity != null) {
            this.totalPrice = this.unitPrice.multiply(new BigDecimal(this.quantity));
        } else {
            this.totalPrice = BigDecimal.ZERO;
        }
    }

}
