package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDTO {
    private Integer id;
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productId;
    
    private String productName;
    
    @NotBlank(message = "Tên biến thể không được để trống")
    private String name;
    
    private String attributes;   // JSON string
    
    @PositiveOrZero(message = "Điều chỉnh giá không được âm")
    private BigDecimal priceAdjustment;
    
    @NotBlank(message = "Mã SKU không được để trống")
    private String sku;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    private Integer quantity;
    
    private String imageUrl;
    
    @PositiveOrZero(message = "Giá cuối cùng không được âm")
    private BigDecimal finalPrice;  // Giá cuối cùng (giá sản phẩm + priceAdjustment)
} 