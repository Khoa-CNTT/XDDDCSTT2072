package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_id", nullable = false)
    private Integer orderId;
    
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "amount", nullable = false)
    private Long amount;
    
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    // Thêm trường payment_id
    @Column(name = "payment_id")
    private String paymentId;
    
    @Column(name = "transaction_id", unique = true)
    private String transactionId;
    
    @Column(name = "transaction_reference")
    private String transactionReference;
    
    @Column(name = "payment_note")
    private String paymentNote;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"payments", "buyer", "seller", "hibernateLazyInitializer", "handler"})
    private Order order;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"payments", "orders", "hibernateLazyInitializer", "handler"})
    private User user;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (paymentId == null) {
            paymentId = "PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 