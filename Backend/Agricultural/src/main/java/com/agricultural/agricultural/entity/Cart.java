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
import java.util.Map;
import java.util.stream.Collectors;

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

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "shipping_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal shippingDiscount = BigDecimal.ZERO;

    @Column(name = "final_total", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal finalTotal = BigDecimal.ZERO;

    @Column(name = "applied_voucher_code")
    private String appliedVoucherCode;

    @Column(name = "applied_shop_vouchers", columnDefinition = "TEXT")
    private String appliedShopVouchers;

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
        discountAmount = BigDecimal.ZERO;
        shippingFee = BigDecimal.ZERO;
        shippingDiscount = BigDecimal.ZERO;
        finalTotal = BigDecimal.ZERO;
        appliedVoucherCode = null;
        appliedShopVouchers = null;
    }

    public void recalculateTotals() {
        int items = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : cartItems) {
            if (item != null && Boolean.TRUE.equals(item.getIsSelected())) {
                Integer quantity = item.getQuantity();
                BigDecimal itemTotal = item.getTotalPrice();
                items += (quantity != null ? quantity : 0);
                total = total.add(itemTotal != null ? itemTotal : BigDecimal.ZERO);
            }
        }

        this.totalItems = items;
        this.subtotal = total;
        
        // Tính giá cuối cùng
        if (this.shippingFee == null) this.shippingFee = BigDecimal.ZERO;
        if (this.shippingDiscount == null) this.shippingDiscount = BigDecimal.ZERO;
        if (this.discountAmount == null) this.discountAmount = BigDecimal.ZERO;
        
        BigDecimal finalShippingFee = this.shippingFee.subtract(this.shippingDiscount);
        if (finalShippingFee.compareTo(BigDecimal.ZERO) < 0) {
            finalShippingFee = BigDecimal.ZERO;
        }
        
        this.finalTotal = this.subtotal
                .subtract(this.discountAmount)
                .add(finalShippingFee);
    }
    
    public Map<Integer, List<CartItem>> getItemsByShop() {
        return cartItems.stream()
                .filter(item -> item.getShopId() != null)
                .collect(Collectors.groupingBy(CartItem::getShopId));
    }
    
    public BigDecimal getShopSubtotal(Integer shopId) {
        return cartItems.stream()
                .filter(item -> shopId.equals(item.getShopId()) && Boolean.TRUE.equals(item.getIsSelected()))
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
