package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productId;
    
    private String productName;
    
    private String productImage;
    
    private Integer variantId;
    
    private String variantName;
    
    // Thêm thông tin về cửa hàng
    private Integer shopId;
    private String shopName;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
    
    @NotNull(message = "Đơn giá không được để trống")
    @PositiveOrZero(message = "Đơn giá không được âm")
    private BigDecimal unitPrice;
    
    @PositiveOrZero(message = "Tổng giá không được âm")
    private BigDecimal totalPrice;
    
    private String notes;
    
    private LocalDateTime addedAt;
    
    private LocalDateTime updatedAt;
    
    // Thông tin bổ sung về sản phẩm
    private String shortDescription;
    
    @PositiveOrZero(message = "Giá gốc không được âm")
    private BigDecimal originalPrice;
    
    private boolean onSale;
    
    @PositiveOrZero(message = "Số tiền giảm giá không được âm")
    private BigDecimal discountAmount;
    
    @PositiveOrZero(message = "Số lượng có sẵn không được âm")
    private int availableQuantity;
} 