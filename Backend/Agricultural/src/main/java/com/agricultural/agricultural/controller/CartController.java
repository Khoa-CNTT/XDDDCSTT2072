package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.CartDTO;
import com.agricultural.agricultural.dto.CartItemDTO;
import com.agricultural.agricultural.service.ICartService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/cart")
@RequiredArgsConstructor
@Validated
public class CartController {

    private final ICartService cartService;

    /**
     * Lấy thông tin giỏ hàng của người dùng đang đăng nhập
     */
    @GetMapping
    public ResponseEntity<CartDTO> getCurrentUserCart() {
        return ResponseEntity.ok(cartService.getCurrentUserCart());
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     *
     * @param productId ID của sản phẩm
     * @param quantity  Số lượng
     * @param variantId ID của biến thể sản phẩm (có thể null)
     * @param notes     Ghi chú (có thể null)
     * @return Thông tin giỏ hàng sau khi thêm
     */
    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItemToCart(
            @RequestParam Integer productId,
            @RequestParam @Min(1) Integer quantity,
            @RequestParam(required = false) Integer variantId,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(cartService.addItemToCart(productId, quantity, variantId, notes));
    }



    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @PathVariable Integer cartItemId,
            @RequestParam @Min(1) Integer quantity,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(cartService.updateCartItem(cartItemId, quantity, notes));
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     *
     * @param cartItemId ID của item trong giỏ hàng
     * @return Thông tin giỏ hàng sau khi xóa
     */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> removeCartItem(@PathVariable Integer cartItemId) {
        return ResponseEntity.ok(cartService.removeCartItem(cartItemId));
    }

    /**
     * Làm trống giỏ hàng
     *
     * @return Thông tin giỏ hàng sau khi làm trống
     */
    @DeleteMapping("/items")
    public ResponseEntity<CartDTO> clearCart() {
        return ResponseEntity.ok(cartService.clearCart());
    }

    /**
     * Kiểm tra tính hợp lệ của giỏ hàng
     *
     * @return Danh sách các item không hợp lệ
     */
    @GetMapping("/validate")
    public ResponseEntity<List<CartItemDTO>> validateCart() {
        return ResponseEntity.ok(cartService.validateCart());
    }

    /**
     * Tính toán phí vận chuyển ước tính
     *
     * @param addressId ID của địa chỉ giao hàng
     * @return Thông tin giỏ hàng với phí vận chuyển
     */
    @GetMapping("/shipping")
    public ResponseEntity<CartDTO> calculateShippingFee(@RequestParam Integer addressId) {
        return ResponseEntity.ok(cartService.calculateShippingFee(addressId));
    }


} 