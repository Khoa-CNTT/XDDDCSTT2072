package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.ProductVisibility;
import com.agricultural.agricultural.entity.enumeration.StockStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "market_place")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketPlace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice;
    
    @Column(name = "sale_start_date")
    private LocalDateTime saleStartDate;
    
    @Column(name = "sale_end_date")
    private LocalDateTime saleEndDate;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "sku", unique = true)
    private String sku;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private ProductCategory category;
    
    @Column
    private Double weight;
    
    @Column
    private String dimensions;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status")
    @Builder.Default
    private StockStatus stockStatus = StockStatus.IN_STOCK;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility")
    @Builder.Default
    private ProductVisibility visibility = ProductVisibility.VISIBLE;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;
    
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;
    
    @Column(name = "purchase_count")
    @Builder.Default
    private Integer purchaseCount = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();
    
    // Helper methods
    public boolean isOnSale() {
        if (salePrice == null || saleStartDate == null || saleEndDate == null) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        return now.isAfter(saleStartDate) && 
               now.isBefore(saleEndDate) && 
               salePrice.compareTo(price) < 0;
    }
    
    public BigDecimal getCurrentPrice() {
        if (isOnSale() && salePrice != null) {
            return salePrice;
        }
        return price != null ? price : BigDecimal.ZERO;
    }
    
    public BigDecimal getDiscountAmount() {
        if (isOnSale() && price != null && salePrice != null) {
            return price.subtract(salePrice);
        }
        return BigDecimal.ZERO;
    }
    
    public BigDecimal getDiscountPercentage() {
        if (isOnSale() && price != null && salePrice != null && price.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = price.subtract(salePrice);
            return discountAmount.multiply(new BigDecimal(100)).divide(price, 0, BigDecimal.ROUND_HALF_UP);
        }
        return BigDecimal.ZERO;
    }
    
    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }
    
    public void removeVariant(ProductVariant variant) {
        variants.remove(variant);
        variant.setProduct(null);
    }
    
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }
    
    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }
} 