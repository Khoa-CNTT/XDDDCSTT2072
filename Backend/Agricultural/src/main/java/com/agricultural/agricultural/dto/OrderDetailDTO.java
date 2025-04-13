package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDTO {
    private Integer id;
    private Integer orderId;
    private Integer productId;
    private String productName;
    private String productImage;
    private Integer variantId;
    private String variantName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal discountAmount;
    private OrderStatus status;
    private ReviewStatus reviewStatus;
} 