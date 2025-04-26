package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ApiResponse;
import com.agricultural.agricultural.dto.request.CouponRequest;
import com.agricultural.agricultural.dto.response.CouponDTO;
import com.agricultural.agricultural.service.ICouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final ICouponService couponService;

    @PostMapping
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<CouponDTO>> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponDTO couponDTO = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(true, "Đã tạo mã giảm giá thành công", couponDTO)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CouponDTO>>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<CouponDTO> coupons = couponService.getAllCoupons(pageable, status);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Danh sách mã giảm giá", coupons)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponDTO>> getCouponById(@PathVariable Integer id) {
        CouponDTO couponDTO = couponService.getCouponById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Thông tin mã giảm giá", couponDTO)
        );
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<CouponDTO>> getCouponByCode(@PathVariable String code) {
        CouponDTO couponDTO = couponService.getCouponByCode(code);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Thông tin mã giảm giá", couponDTO)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<CouponDTO>> updateCoupon(
            @PathVariable Integer id,
            @Valid @RequestBody CouponRequest request
    ) {
        CouponDTO couponDTO = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Đã cập nhật mã giảm giá thành công", couponDTO)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Integer id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Đã xóa mã giảm giá thành công", null)
        );
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CouponDTO>>> getActiveCoupons() {
        List<CouponDTO> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Danh sách mã giảm giá đang hoạt động", coupons)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<CouponDTO>>> getCouponsForUser(@PathVariable Integer userId) {
        List<CouponDTO> coupons = couponService.getCouponsForUser(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Danh sách mã giảm giá cho người dùng", coupons)
        );
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<CouponDTO>>> getCouponsForProduct(@PathVariable Integer productId) {
        List<CouponDTO> coupons = couponService.getCouponsForProduct(productId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Danh sách mã giảm giá cho sản phẩm", coupons)
        );
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<CouponDTO>>> getCouponsForCategory(@PathVariable Integer categoryId) {
        List<CouponDTO> coupons = couponService.getCouponsForCategory(categoryId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Danh sách mã giảm giá cho danh mục", coupons)
        );
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponDTO>> validateCoupon(
            @RequestParam String code,
            @RequestParam Integer userId,
            @RequestParam BigDecimal orderAmount
    ) {
        CouponDTO couponDTO = couponService.validateCoupon(code, userId, orderAmount);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Mã giảm giá hợp lệ", couponDTO)
        );
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<BigDecimal>> applyCoupon(
            @RequestParam Integer orderId,
            @RequestParam String couponCode
    ) {
        BigDecimal discountAmount = couponService.applyCoupon(orderId, couponCode);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Đã áp dụng mã giảm giá thành công", discountAmount)
        );
    }

    @PostMapping("/remove")
    public ResponseEntity<ApiResponse<Void>> removeCouponFromOrder(
            @RequestParam Integer orderId,
            @RequestParam Integer couponId
    ) {
        couponService.removeCouponFromOrder(orderId, couponId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Đã hủy mã giảm giá thành công", null)
        );
    }

    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateDiscount(
            @RequestParam String couponCode,
            @RequestParam BigDecimal orderAmount
    ) {
        BigDecimal discountAmount = couponService.calculateDiscount(couponCode, orderAmount);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Số tiền giảm giá", discountAmount)
        );
    }
} 