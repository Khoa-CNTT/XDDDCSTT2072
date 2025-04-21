package com.agricultural.agricultural.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleItemResponse {
    private Integer id;
    private Integer productId;
    private String productName;
    private String productImage;
    private Integer stockQuantity;
    private Integer soldQuantity;
    private Integer remainingStock;
    private BigDecimal discountPrice;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private boolean hasStock;
} 