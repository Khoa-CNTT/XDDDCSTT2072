package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private MarketPlace product;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "json")
    private String attributes;  // JSON string để lưu các thuộc tính như {"color": "Đỏ", "size": "XL"}
    
    @Column(name = "price_adjustment", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal priceAdjustment = BigDecimal.ZERO;
    
    @Column(unique = true)
    private String sku;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    // Helper methods
    public BigDecimal getFinalPrice() {
        if (product == null) {
            return priceAdjustment;
        }
        
        BigDecimal basePrice = product.getCurrentPrice();
        return basePrice.add(priceAdjustment);
    }
} 