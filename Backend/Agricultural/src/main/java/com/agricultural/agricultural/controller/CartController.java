package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.CartDTO;
import com.agricultural.agricultural.dto.CartItemDTO;
import com.agricultural.agricultural.dto.CartResponseDTO;
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
     * Lấy thông tin giỏ hàng theo định dạng giống Shopee
     */
    @GetMapping("/shop-view")
    public ResponseEntity<CartResponseDTO> getCartResponse() {
        return ResponseEntity.ok(cartService.getCartResponse());
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
     * Xóa toàn bộ giỏ hàng
     *
     * @return Thông tin giỏ hàng sau khi xóa
     */
    @DeleteMapping
    public ResponseEntity<CartDTO> deleteCart() {
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
    
    /**
     * Chọn/bỏ chọn các sản phẩm trong giỏ hàng
     * 
     * @param cartItemIds Danh sách ID sản phẩm trong giỏ hàng
     * @param selected True nếu muốn chọn, False nếu muốn bỏ chọn
     * @return Thông tin giỏ hàng sau khi cập nhật
     */
    @PutMapping("/items/select")
    public ResponseEntity<CartDTO> selectCartItems(
            @RequestParam List<Integer> cartItemIds,
            @RequestParam boolean selected) {
        return ResponseEntity.ok(cartService.selectCartItems(cartItemIds, selected));
    }
    
    /**
     * Chọn/bỏ chọn tất cả sản phẩm trong giỏ hàng
     * 
     * @param selected True nếu muốn chọn tất cả, False nếu muốn bỏ chọn tất cả
     * @return Thông tin giỏ hàng sau khi cập nhật
     */
    @PutMapping("/items/select-all")
    public ResponseEntity<CartDTO> selectAllCartItems(@RequestParam boolean selected) {
        return ResponseEntity.ok(cartService.selectAllCartItems(selected));
    }
    
    /**
     * Áp dụng mã giảm giá (voucher) vào giỏ hàng
     * 
     * @param voucherCode Mã giảm giá
     * @return Thông tin giỏ hàng sau khi áp dụng voucher
     */
    @PostMapping("/voucher/apply")
    public ResponseEntity<CartDTO> applyVoucher(@RequestParam String voucherCode) {
        return ResponseEntity.ok(cartService.applyVoucher(voucherCode));
    }
    
    /**
     * Hủy bỏ mã giảm giá (voucher) đã áp dụng
     * 
     * @param type Loại voucher (PLATFORM, SHOP, SHIPPING)
     * @param shopId ID của shop (chỉ cần thiết khi type = SHOP)
     * @return Thông tin giỏ hàng sau khi hủy voucher
     */
    @DeleteMapping("/voucher/remove")
    public ResponseEntity<CartDTO> removeVoucher(
            @RequestParam String type,
            @RequestParam(required = false) Integer shopId) {
        return ResponseEntity.ok(cartService.removeVoucher(type, shopId));
    }
} 