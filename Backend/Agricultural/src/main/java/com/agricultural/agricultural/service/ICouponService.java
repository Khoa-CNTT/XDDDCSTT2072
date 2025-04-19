package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.request.CouponRequest;
import com.agricultural.agricultural.dto.response.CouponDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ICouponService {
    
    /**
     * Tạo mới mã giảm giá
     */
    CouponDTO createCoupon(CouponRequest request);
    
    /**
     * Cập nhật mã giảm giá
     */
    CouponDTO updateCoupon(Integer id, CouponRequest request);
    
    /**
     * Lấy thông tin mã giảm giá theo ID
     */
    CouponDTO getCouponById(Integer id);
    
    /**
     * Lấy thông tin mã giảm giá theo code
     */
    CouponDTO getCouponByCode(String code);
    
    /**
     * Xóa mã giảm giá
     */
    void deleteCoupon(Integer id);
    
    /**
     * Tìm tất cả mã giảm giá (có phân trang)
     */
    Page<CouponDTO> getAllCoupons(Pageable pageable, String status);
    
    /**
     * Lấy danh sách mã giảm giá đang hoạt động
     */
    List<CouponDTO> getActiveCoupons();
    
    /**
     * Lấy danh sách mã giảm giá áp dụng cho người dùng
     */
    List<CouponDTO> getCouponsForUser(Integer userId);
    
    /**
     * Lấy danh sách mã giảm giá áp dụng cho sản phẩm
     */
    List<CouponDTO> getCouponsForProduct(Integer productId);
    
    /**
     * Lấy danh sách mã giảm giá áp dụng cho danh mục
     */
    List<CouponDTO> getCouponsForCategory(Integer categoryId);
    
    /**
     * Xác thực mã giảm giá
     */
    CouponDTO validateCoupon(String code, Integer userId, BigDecimal orderAmount);
    
    /**
     * Áp dụng mã giảm giá cho đơn hàng
     */
    BigDecimal applyCoupon(Integer orderId, String couponCode);
    
    /**
     * Hủy áp dụng mã giảm giá cho đơn hàng
     */
    void removeCouponFromOrder(Integer orderId, Integer couponId);
    
    /**
     * Tính toán số tiền giảm giá khi áp dụng coupon
     */
    BigDecimal calculateDiscount(String couponCode, BigDecimal orderAmount);
} 