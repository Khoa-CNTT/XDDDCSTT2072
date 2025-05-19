package com.agricultural.agricultural.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemDTO {
    private Integer id;
    private Integer wishlistId;
    private Integer productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private BigDecimal salePrice;
    private Boolean isOnSale;
    private Integer variantId;
    private String variantName;
    private LocalDateTime addedAt;
} 