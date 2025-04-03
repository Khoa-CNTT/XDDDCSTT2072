package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "buyer_id", nullable = false)
    private Integer buyerId;

    @Column(name = "seller_id", nullable = false)
    private Integer sellerId;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @ManyToOne
    @JoinColumn(name = "buyer_id", insertable = false, updatable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "seller_id", insertable = false, updatable = false)
    private User seller;

    @OneToMany(mappedBy = "order")
    private List<OrderDetail> orderDetails;

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
    }
} 