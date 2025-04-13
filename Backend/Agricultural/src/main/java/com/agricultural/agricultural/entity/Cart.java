package com.agricultural.agricultural.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_items", nullable = false)
    @Builder.Default
    private Integer totalItems = 0;

    @Column(name = "subtotal", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    // Helper methods
    public void addItem(CartItem item) {
        cartItems.add(item);
        item.setCart(this);
        recalculateTotals(); // Đảm bảo đồng bộ lại totals sau khi thêm
    }

    public void removeItem(CartItem item) {
        cartItems.remove(item);
        item.setCart(null);
        recalculateTotals(); // Cập nhật lại totals
    }

    public void clearItems() {
        cartItems.clear();
        totalItems = 0;
        subtotal = BigDecimal.ZERO;
    }

    public void recalculateTotals() {
        int items = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : cartItems) {
            if (item != null) {
                Integer quantity = item.getQuantity();
                BigDecimal itemTotal = item.getTotalPrice();
                items += (quantity != null ? quantity : 0);
                total = total.add(itemTotal != null ? itemTotal : BigDecimal.ZERO);
            }
        }

        this.totalItems = items;
        this.subtotal = total;
    }
}
