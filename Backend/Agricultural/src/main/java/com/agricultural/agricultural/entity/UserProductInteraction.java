package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ thông tin về tương tác của người dùng với sản phẩm
 * Được sử dụng cho hệ thống gợi ý sản phẩm
 */
@Entity
@Table(name = "user_product_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProductInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "product_id", nullable = false)
    private Integer productId;
    
    /**
     * Loại tương tác: VIEW, CART, PURCHASE, WISHLIST, REVIEW
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InteractionType type;
    
    /**
     * Điểm tương tác, càng cao càng quan trọng:
     * - Xem: 1
     * - Thêm vào giỏ hàng: 2
     * - Thêm vào wishlist: 3
     * - Đánh giá: 4
     * - Mua: 5
     */
    @Column(name = "interaction_score")
    private Integer interactionScore;
    
    /**
     * Số lần tương tác
     */
    @Column(name = "interaction_count", nullable = false)
    private Integer interactionCount = 1;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * Enum định nghĩa các loại tương tác của người dùng với sản phẩm
     */
    public enum InteractionType {
        VIEW,       // Người dùng xem sản phẩm
        CART,       // Người dùng thêm sản phẩm vào giỏ hàng
        WISHLIST,   // Người dùng thêm sản phẩm vào danh sách yêu thích
        PURCHASE,   // Người dùng mua sản phẩm
        REVIEW      // Người dùng đánh giá sản phẩm
    }
    
    /**
     * Tăng số lần tương tác
     */
    public void incrementInteractionCount() {
        this.interactionCount += 1;
    }
} 