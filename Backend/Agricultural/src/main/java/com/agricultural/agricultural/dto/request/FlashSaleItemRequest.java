package com.agricultural.agricultural.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleItemRequest {
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;
    
    @NotNull(message = "Số lượng tồn không được để trống")
    @Min(value = 1, message = "Số lượng tồn phải lớn hơn 0")
    private Integer stockQuantity;
    
    @NotNull(message = "Giá sau giảm không được để trống")
    @Min(value = 0, message = "Giá sau giảm không được âm")
    private BigDecimal discountPrice;
    
    @NotNull(message = "Giá gốc không được để trống")
    @Min(value = 0, message = "Giá gốc không được âm")
    private BigDecimal originalPrice;
    
    private Integer discountPercentage;
} 