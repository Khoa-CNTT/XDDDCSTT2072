package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.CartDTO;
import com.agricultural.agricultural.dto.CartItemDTO;

import java.util.List;

public interface ICartService {
    /**
     * Lấy thông tin giỏ hàng của người dùng hiện tại
     * 
     * @return Thông tin giỏ hàng
     */
    CartDTO getCurrentUserCart();
    
    /**
     * Lấy thông tin giỏ hàng theo ID người dùng
     * 
     * @param userId ID của người dùng
     * @return Thông tin giỏ hàng
     */
    CartDTO getCartByUserId(Integer userId);
    
    /**
     * Thêm sản phẩm vào giỏ hàng
     * 
     * @param productId ID của sản phẩm
     * @param quantity Số lượng
     * @param variantId ID của biến thể sản phẩm (có thể null)
     * @param notes Ghi chú (có thể null)
     * @return Thông tin giỏ hàng sau khi thêm
     */
    CartDTO addItemToCart(Integer productId, Integer quantity, Integer variantId, String notes);
    
    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * 
     * @param cartItemId ID của item trong giỏ hàng
     * @param quantity Số lượng mới
     * @param notes Ghi chú mới (có thể null)
     * @return Thông tin giỏ hàng sau khi cập nhật
     */
    CartDTO updateCartItem(Integer cartItemId, Integer quantity, String notes);
    
    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * 
     * @param cartItemId ID của item trong giỏ hàng
     * @return Thông tin giỏ hàng sau khi xóa
     */
    CartDTO removeCartItem(Integer cartItemId);
    
    /**
     * Làm trống giỏ hàng
     * 
     * @return Thông tin giỏ hàng sau khi làm trống
     */
    CartDTO clearCart();
    
    /**
     * Kiểm tra tính hợp lệ của giỏ hàng (số lượng, tồn kho...)
     * 
     * @return Danh sách các item không hợp lệ
     */
    List<CartItemDTO> validateCart();
    
    /**
     * Tính toán phí vận chuyển ước tính
     * 
     * @param addressId ID của địa chỉ giao hàng
     * @return Thông tin giỏ hàng với phí vận chuyển
     */
    CartDTO calculateShippingFee(Integer addressId);
} 