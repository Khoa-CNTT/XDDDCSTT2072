package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ thông tin kết nối giữa người dùng (kiểu connections của LinkedIn)
 */
@Entity
@Table(name = "user_connections", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "connected_user_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserConnection {
    
    public enum ConnectionStatus {
        PENDING,    // Đang chờ chấp nhận
        ACCEPTED,   // Đã chấp nhận
        REJECTED,   // Đã từ chối
        BLOCKED     // Đã chặn
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connected_user_id", nullable = false)
    private User connectedUser;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ConnectionStatus status = ConnectionStatus.PENDING;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        if (user != null && connectedUser != null && user.equals(connectedUser)) {
            throw new IllegalStateException("Không thể tạo kết nối với chính mình");
        }
    }
} 