package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Gói đăng ký theo dõi thời tiết
 * Định nghĩa các gói đăng ký khác nhau với số lượng địa điểm được phép đăng ký
 */
@Entity
@Table(name = "subscription_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;
    
    @Column(name = "max_locations", nullable = false)
    private Integer maxLocations;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "is_free", nullable = false)
    private Boolean isFree = false;
    
    /**
     * Quyền đăng ký bán hàng (Chỉ gói Premium có quyền này)
     */
    @Column(name = "can_sell_products", nullable = false)
    private Boolean canSellProducts = false;
    
    /**
     * Quyền tham gia diễn đàn (Cả Free và Premium đều có)
     */
    @Column(name = "can_access_forum", nullable = false)
    private Boolean canAccessForum = true;
    
    /**
     * Quyền mua sản phẩm (Cả Free và Premium đều có)
     */
    @Column(name = "can_purchase_products", nullable = false)
    private Boolean canPurchaseProducts = true;
    
    /**
     * Quyền sử dụng AI chat (Cả Free và Premium đều có)
     */
    @Column(name = "can_use_ai_chat", nullable = false)
    private Boolean canUseAIChat = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 