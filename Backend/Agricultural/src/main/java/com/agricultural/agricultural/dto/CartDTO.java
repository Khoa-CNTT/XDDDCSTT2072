package com.agricultural.agricultural.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Integer id;
    
    @NotNull(message = "ID người dùng không được để trống")
    private Integer userId;
    
    private String userName;
    
    @PositiveOrZero(message = "Tổng số sản phẩm không được âm")
    private Integer totalItems;
    
    @PositiveOrZero(message = "Tổng giá trị không được âm")
    private BigDecimal subtotal;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Builder.Default
    @Valid
    private List<CartItemDTO> cartItems = new ArrayList<>();
    
    // Thông tin bổ sung
    @PositiveOrZero(message = "Phí vận chuyển không được âm")
    private BigDecimal estimatedShippingFee;
    
    @PositiveOrZero(message = "Thuế không được âm")
    private BigDecimal estimatedTax;
    
    private BigDecimal totalAmount;
    
    // Phương thức để tính toán tổng tiền
    public BigDecimal getTotalAmount() {
        if (subtotal == null) {
            subtotal = BigDecimal.ZERO;
        }
        
        BigDecimal shipping = estimatedShippingFee != null ? estimatedShippingFee : BigDecimal.ZERO;
        BigDecimal tax = estimatedTax != null ? estimatedTax : BigDecimal.ZERO;
        
        return subtotal.add(shipping).add(tax);
    }
} 