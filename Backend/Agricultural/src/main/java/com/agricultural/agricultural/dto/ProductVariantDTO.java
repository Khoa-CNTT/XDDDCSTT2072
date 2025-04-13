package com.agricultural.agricultural.dto;

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
    private Integer productId;
    private String productName;
    private String name;
    private String attributes;   // JSON string
    private BigDecimal priceAdjustment;
    private String sku;
    private Integer quantity;
    private String imageUrl;
    private BigDecimal finalPrice;  // Giá cuối cùng (giá sản phẩm + priceAdjustment)
} 