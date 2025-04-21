package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTracking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "order_id", nullable = false)
    private Integer orderId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
    
    @Column(name = "updated_by")
    private Integer updatedBy;
    
    @ManyToOne
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
} 