package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Đăng ký bán hàng - Lưu trữ thông tin đăng ký bán hàng của người dùng
 */
@Entity
@Table(name = "seller_registrations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerRegistration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * Trạng thái đăng ký
     * PENDING: Đang chờ xét duyệt
     * APPROVED: Đã được chấp thuận
     * REJECTED: Đã bị từ chối
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";
    
    /**
     * Ghi chú, lý do từ chối hoặc thông tin bổ sung
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    /**
     * Admin xử lý yêu cầu
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processed_by")
    private User processedBy;
    
    /**
     * Thời điểm xử lý yêu cầu
     */
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    /**
     * Các thông tin bổ sung về người bán
     */
    @Column(name = "business_name", length = 100)
    private String businessName;
    
    @Column(name = "business_address", length = 255)
    private String businessAddress;
    
    @Column(name = "business_phone", length = 20)
    private String businessPhone;
    
    @Column(name = "tax_code", length = 50)
    private String taxCode;
    
    /**
     * Mô tả về doanh nghiệp
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Đảm bảo createdAt luôn có giá trị
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
} 