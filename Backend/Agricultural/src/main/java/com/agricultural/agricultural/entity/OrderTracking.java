package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "order_id", nullable = false)
    private Integer orderId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "updated_by")
    private Integer updatedBy;
    
    @ManyToOne
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
} 