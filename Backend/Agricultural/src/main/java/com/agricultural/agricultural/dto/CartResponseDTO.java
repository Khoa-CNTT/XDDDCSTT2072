package com.agricultural.agricultural.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO {
    private Integer id;
    private Integer userId;
    private String userName;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal shippingDiscount;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private String appliedVoucherCode;
    
    @Builder.Default
    private List<ShopGroupDTO> shopGroups = new ArrayList<>();
    
    @Builder.Default
    private List<VoucherDTO> availableVouchers = new ArrayList<>();
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShopGroupDTO {
        private Integer shopId;
        private String shopName;
        private Boolean isOfficial;
        private String shopImage;
        private BigDecimal shopSubtotal;
        private String appliedShopVoucherCode;
        private BigDecimal shopDiscountAmount;
        
        @Builder.Default
        private List<CartItemDTO> items = new ArrayList<>();
        
        @Builder.Default
        private List<VoucherDTO> shopVouchers = new ArrayList<>();
        
        @Builder.Default
        private List<ShippingOptionDTO> shippingOptions = new ArrayList<>();
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShippingOptionDTO {
        private String id;
        private String name;
        private String description;
        private BigDecimal fee;
        private String estimatedDelivery;
        private Boolean isSelected;
    }
} 