package com.agricultural.agricultural.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCategory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ProductCategory parent;
    
    @OneToMany(mappedBy = "parent")
    @JsonIgnore
    @Builder.Default
    private List<ProductCategory> children = new ArrayList<>();
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "category")
    @JsonIgnore
    @Builder.Default
    private List<MarketPlace> products = new ArrayList<>();
    
    // Helper methods
    public void addChild(ProductCategory child) {
        children.add(child);
        child.setParent(this);
    }
    
    public void removeChild(ProductCategory child) {
        children.remove(child);
        child.setParent(null);
    }
} 