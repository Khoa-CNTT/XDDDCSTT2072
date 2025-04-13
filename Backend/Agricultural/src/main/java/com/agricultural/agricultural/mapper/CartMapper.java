package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.CartDTO;
import com.agricultural.agricultural.dto.CartItemDTO;
import com.agricultural.agricultural.entity.Cart;
import com.agricultural.agricultural.entity.CartItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {
    CartMapper INSTANCE = Mappers.getMapper(CartMapper.class);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userName")
    @Mapping(target = "estimatedShippingFee", ignore = true)
    @Mapping(target = "estimatedTax", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    CartDTO toDTO(Cart cart);

    @AfterMapping
    default void calculateTotalAmount(@MappingTarget CartDTO cartDTO) {
        if (cartDTO.getSubtotal() != null) {
            BigDecimal shipping = cartDTO.getEstimatedShippingFee() != null ? cartDTO.getEstimatedShippingFee() : BigDecimal.ZERO;
            BigDecimal tax = cartDTO.getEstimatedTax() != null ? cartDTO.getEstimatedTax() : BigDecimal.ZERO;
            cartDTO.setTotalAmount(cartDTO.getSubtotal().add(shipping).add(tax));
        } else {
            cartDTO.setTotalAmount(BigDecimal.ZERO);
        }
    }

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "deleted", constant = "false")
    Cart toEntity(CartDTO cartDTO);

    List<CartDTO> toDTOList(List<Cart> carts);

    @Mapping(source = "cart.id", target = "cartId")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.imageUrl", target = "productImage")
    @Mapping(source = "product.shortDescription", target = "shortDescription")
    @Mapping(source = "product.price", target = "originalPrice")
    @Mapping(expression = "java(cartItem.getProduct().isOnSale())", target = "onSale")
    @Mapping(expression = "java(cartItem.getProduct().getDiscountAmount())", target = "discountAmount")
    @Mapping(source = "product.quantity", target = "availableQuantity")
    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(source = "variant.name", target = "variantName")
    @Mapping(expression = "java(cartItem.getTotalPrice() != null ? cartItem.getTotalPrice() : (cartItem.getUnitPrice() != null && cartItem.getQuantity() != null ? cartItem.getUnitPrice().multiply(new java.math.BigDecimal(cartItem.getQuantity())) : null))", target = "totalPrice")
    CartItemDTO toDTO(CartItem cartItem);

    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variant", ignore = true)
    CartItem toEntity(CartItemDTO cartItemDTO);

    List<CartItemDTO> toCartItemDTOList(List<CartItem> cartItems);

    void updateCartFromDTO(CartDTO dto, @MappingTarget Cart entity);
    
    void updateCartItemFromDTO(CartItemDTO dto, @MappingTarget CartItem entity);
} 