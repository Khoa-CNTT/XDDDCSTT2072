package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.PaymentMethod;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
    
    @PositiveOrZero(message = "Tổng số lượng sản phẩm không được âm")
    private Integer totalQuantity;
    
    @PositiveOrZero(message = "Tổng tiền hàng không được âm")
    private BigDecimal subtotal;
    
    @PositiveOrZero(message = "Phí vận chuyển không được âm")
    private BigDecimal shippingFee;
    
    @PositiveOrZero(message = "Thuế không được âm")
    private BigDecimal taxAmount;
    
    @PositiveOrZero(message = "Giảm giá không được âm")
    private BigDecimal discountAmount;
    
    @PositiveOrZero(message = "Tổng tiền không được âm")
    private BigDecimal totalAmount;
    
    private Integer buyerId;
    
    private Integer sellerId;
    
    private PaymentMethod paymentMethod;
    
    private PaymentStatus paymentStatus;
    
    private String shippingName;
    
    private String shippingPhone;
    
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
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
    @NotEmpty(message = "Chi tiết đơn hàng không được để trống")
    @Valid
    private List<OrderDetailDTO> orderDetails = new ArrayList<>();
} 