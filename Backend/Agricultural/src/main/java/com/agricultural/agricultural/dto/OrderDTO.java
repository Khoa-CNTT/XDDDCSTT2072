package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.PaymentMethod;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Integer id;
    private String orderNumber;
    private Integer totalQuantity;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private Integer buyerId;
    private Integer sellerId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingCity;
    private String shippingCountry;
    private String shippingPostalCode;
    private String notes;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDateTime orderDate;
    private LocalDateTime completedDate;
    private LocalDateTime cancelledDate;
    private String cancellationReason;
    private LocalDateTime updatedAt;
    private OrderStatus status;
    private String buyerName;
    private String sellerName;

    @Builder.Default
    private List<OrderDetailDTO> orderDetails = new ArrayList<>();
} 