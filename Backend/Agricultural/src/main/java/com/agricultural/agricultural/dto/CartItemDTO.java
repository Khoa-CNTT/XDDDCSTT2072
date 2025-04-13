package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Integer id;
    private Integer cartId;
    private Integer productId;
    private String productName;
    private String productImage;
    private Integer variantId;
    private String variantName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String notes;
    private LocalDateTime addedAt;
    private LocalDateTime updatedAt;
    
    // Thông tin bổ sung về sản phẩm
    private String shortDescription;
    private BigDecimal originalPrice;
    private boolean onSale;
    private BigDecimal discountAmount;
    private int availableQuantity;
} 