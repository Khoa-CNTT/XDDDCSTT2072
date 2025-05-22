package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.CartDTO;
import com.agricultural.agricultural.dto.CartItemDTO;
import com.agricultural.agricultural.dto.CartResponseDTO;

import java.util.List;

public interface ICartService {

    CartDTO getCurrentUserCart();
    

    CartDTO getCartByUserId(Integer userId);
    

    CartDTO addItemToCart(Integer productId, Integer quantity, Integer variantId, String notes);
    

    CartDTO updateCartItem(Integer cartItemId, Integer quantity, String notes);
    

    CartDTO removeCartItem(Integer cartItemId);
    

    CartDTO clearCart();
    

    List<CartItemDTO> validateCart();
    


    CartDTO calculateShippingFee(Integer addressId);
    

    CartDTO selectCartItems(List<Integer> cartItemIds, boolean selected);
    

    CartDTO selectAllCartItems(boolean selected);
    

    CartDTO applyVoucher(String voucherCode);
    

    CartDTO removeVoucher(String type, Integer shopId);
    

    CartResponseDTO getCartResponse();
} 