package com.agricultural.agricultural.dto;

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
    private Integer userId;
    private String userName;
    private Integer totalItems;
    private BigDecimal subtotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Builder.Default
    private List<CartItemDTO> cartItems = new ArrayList<>();
    
    // Thông tin bổ sung
    private BigDecimal estimatedShippingFee;
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