package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ thông tin về mối quan hệ giữa các sản phẩm
 * Được sử dụng cho hệ thống gợi ý sản phẩm
 */
@Entity
@Table(name = "product_relationships", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"source_product_id", "target_product_id", "relationship_type"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    /**
     * ID của sản phẩm nguồn
     */
    @Column(name = "source_product_id", nullable = false)
    private Integer sourceProductId;
    
    /**
     * ID của sản phẩm đích
     */
    @Column(name = "target_product_id", nullable = false)
    private Integer targetProductId;
    
    /**
     * Loại mối quan hệ: SIMILAR, BOUGHT_TOGETHER, VIEWED_TOGETHER
     */
    @Column(name = "relationship_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private RelationshipType relationshipType;
    
    /**
     * Điểm tương đồng hoặc điểm liên quan giữa hai sản phẩm
     * Giá trị từ 0 đến 1
     */
    @Column(name = "strength_score", nullable = false)
    private Float strengthScore = 0.0f;
    
    /**
     * Số lần xuất hiện cùng nhau (đối với BOUGHT_TOGETHER và VIEWED_TOGETHER)
     */
    @Column(name = "occurrence_count")
    private Integer occurrenceCount = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * Enum định nghĩa các loại mối quan hệ giữa sản phẩm
     */
    public enum RelationshipType {
        SIMILAR,         // Sản phẩm tương tự (dựa trên thuộc tính, danh mục...)
        BOUGHT_TOGETHER, // Sản phẩm thường được mua cùng nhau
        VIEWED_TOGETHER  // Sản phẩm thường được xem cùng nhau
    }
    
    /**
     * Tăng số lần xuất hiện cùng nhau
     */
    public void incrementOccurrenceCount() {
        this.occurrenceCount += 1;
    }
    
    /**
     * Cập nhật điểm số tương đồng
     */
    public void updateStrengthScore(float newScore) {
        // Áp dụng trọng số nhẹ để cập nhật điểm số
        // 80% điểm số cũ + 20% điểm số mới
        this.strengthScore = 0.8f * this.strengthScore + 0.2f * newScore;
    }
} 