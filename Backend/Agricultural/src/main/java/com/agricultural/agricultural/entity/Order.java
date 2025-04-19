package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.PaymentMethod;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;
    
    @Column(name = "total_quantity", nullable = false)
    @Builder.Default
    private Integer totalQuantity = 0;
    
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(name = "shipping_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;
    
    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "buyer_id", nullable = false)
    private Integer buyerId;

    @Column(name = "seller_id", nullable = false)
    private Integer sellerId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.COD;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "shipping_name", nullable = false)
    private String shippingName;
    
    @Column(name = "shipping_phone", nullable = false)
    private String shippingPhone;
    
    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;
    
    @Column(name = "shipping_city")
    private String shippingCity;
    
    @Column(name = "shipping_country")
    @Builder.Default
    private String shippingCountry = "Vietnam";
    
    @Column(name = "shipping_postal_code")
    private String shippingPostalCode;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "invoice_number")
    private String invoiceNumber;
    
    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @CreationTimestamp
    @Column(name = "order_date")
    private LocalDateTime orderDate;
    
    @Column(name = "completed_date")
    private LocalDateTime completedDate;
    
    @Column(name = "cancelled_date")
    private LocalDateTime cancelledDate;
    
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "buyer_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "payments", "hibernateLazyInitializer", "handler"})
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "seller_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"orders", "payments", "hibernateLazyInitializer", "handler"})
    private User seller;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderDetail> orderDetails = new ArrayList<>();
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonIgnore
    @Builder.Default
    private List<OrderTracking> orderTrackings = new ArrayList<>();
    
    // Helper methods
    public void addOrderDetail(OrderDetail orderDetail) {
        orderDetails.add(orderDetail);
        orderDetail.setOrder(this);
    }
    
    public void removeOrderDetail(OrderDetail orderDetail) {
        orderDetails.remove(orderDetail);
        orderDetail.setOrder(null);
    }
    
    public void addOrderTracking(OrderTracking orderTracking) {
        orderTrackings.add(orderTracking);
        orderTracking.setOrder(this);
    }
    
    public void calculateTotals() {
        this.totalQuantity = 0;
        this.subtotal = BigDecimal.ZERO;
        
        // Kiểm tra null cho orderDetails
        if (orderDetails != null && !orderDetails.isEmpty()) {
            for (OrderDetail detail : orderDetails) {
                if (detail.getQuantity() != null) {
                    this.totalQuantity += detail.getQuantity();
                }
                
                // Kiểm tra null cho totalPrice
                if (detail.getTotalPrice() != null) {
                    this.subtotal = this.subtotal.add(detail.getTotalPrice());
                } else {
                    // Tính toán tại chỗ nếu totalPrice chưa được tính
                    if (detail.getPrice() != null && detail.getQuantity() != null) {
                        BigDecimal finalPrice = detail.getPrice();
                        if (detail.getDiscountAmount() != null) {
                            finalPrice = finalPrice.subtract(detail.getDiscountAmount());
                        }
                        BigDecimal detailTotal = finalPrice.multiply(new BigDecimal(detail.getQuantity()));
                        this.subtotal = this.subtotal.add(detailTotal);
                    }
                }
            }
        }
        
        // Khởi tạo giá trị mặc định nếu cần
        if (this.shippingFee == null) this.shippingFee = BigDecimal.ZERO;
        if (this.taxAmount == null) this.taxAmount = BigDecimal.ZERO;
        if (this.discountAmount == null) this.discountAmount = BigDecimal.ZERO;
        
        // Tính tổng giá trị đơn hàng với các giá trị đã được kiểm tra null
        this.totalAmount = this.subtotal
                .add(this.shippingFee)
                .add(this.taxAmount)
                .subtract(this.discountAmount);
    }
    
    // Phương thức để tạo mã đơn hàng mới
    public static String generateOrderNumber() {
        // Format: OR + YYYYMMDD + RandomNumbers(6)
        String datePart = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%06d", new java.util.Random().nextInt(1000000));
        return "OR" + datePart + randomPart;
    }
    
    @PrePersist
    protected void onCreate() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
        
        if (orderNumber == null || orderNumber.isEmpty()) {
            orderNumber = generateOrderNumber();
        }
        
        calculateTotals();
    }
    
    @PreUpdate
    protected void onUpdate() {
        calculateTotals();
        
        // Cập nhật thời gian hoàn thành hoặc hủy
        if (status == OrderStatus.COMPLETED && completedDate == null) {
            completedDate = LocalDateTime.now();
        } else if (status == OrderStatus.CANCELLED && cancelledDate == null) {
            cancelledDate = LocalDateTime.now();
        }
    }
} 