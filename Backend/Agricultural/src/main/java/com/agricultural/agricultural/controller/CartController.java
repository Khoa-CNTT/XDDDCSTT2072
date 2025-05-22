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


    @GetMapping
    public ResponseEntity<CartDTO> getCurrentUserCart() {
        return ResponseEntity.ok(cartService.getCurrentUserCart());
    }
    

    @GetMapping("/shop-view")
    public ResponseEntity<CartResponseDTO> getCartResponse() {
        return ResponseEntity.ok(cartService.getCartResponse());
    }


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


    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> removeCartItem(@PathVariable Integer cartItemId) {
        return ResponseEntity.ok(cartService.removeCartItem(cartItemId));
    }

    @DeleteMapping("/items")
    public ResponseEntity<CartDTO> clearCart() {
        return ResponseEntity.ok(cartService.clearCart());
    }
    

    @DeleteMapping
    public ResponseEntity<CartDTO> deleteCart() {
        return ResponseEntity.ok(cartService.clearCart());
    }


    @GetMapping("/validate")
    public ResponseEntity<List<CartItemDTO>> validateCart() {
        return ResponseEntity.ok(cartService.validateCart());
    }


    @GetMapping("/shipping")
    public ResponseEntity<CartDTO> calculateShippingFee(@RequestParam Integer addressId) {
        return ResponseEntity.ok(cartService.calculateShippingFee(addressId));
    }
    

    @PutMapping("/items/select")
    public ResponseEntity<CartDTO> selectCartItems(
            @RequestParam List<Integer> cartItemIds,
            @RequestParam boolean selected) {
        return ResponseEntity.ok(cartService.selectCartItems(cartItemIds, selected));
    }
    

    @PutMapping("/items/select-all")
    public ResponseEntity<CartDTO> selectAllCartItems(@RequestParam boolean selected) {
        return ResponseEntity.ok(cartService.selectAllCartItems(selected));
    }
    

    @PostMapping("/voucher/apply")
    public ResponseEntity<CartDTO> applyVoucher(@RequestParam String voucherCode) {
        return ResponseEntity.ok(cartService.applyVoucher(voucherCode));
    }
    

    @DeleteMapping("/voucher/remove")
    public ResponseEntity<CartDTO> removeVoucher(
            @RequestParam String type,
            @RequestParam(required = false) Integer shopId) {
        return ResponseEntity.ok(cartService.removeVoucher(type, shopId));
    }
} 