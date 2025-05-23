package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.request.CouponRequest;
import com.agricultural.agricultural.dto.response.CouponDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ICouponService {
    

    CouponDTO createCoupon(CouponRequest request);
    

    CouponDTO updateCoupon(Integer id, CouponRequest request);
    

    CouponDTO getCouponById(Integer id);
    

    CouponDTO getCouponByCode(String code);
    

    void deleteCoupon(Integer id);
    

    Page<CouponDTO> getAllCoupons(Pageable pageable, String status);
    

    List<CouponDTO> getActiveCoupons();
    

    List<CouponDTO> getCouponsForUser(Integer userId);
    

    List<CouponDTO> getCouponsForProduct(Integer productId);
    


    List<CouponDTO> getCouponsForCategory(Integer categoryId);
    

    CouponDTO validateCoupon(String code, Integer userId, BigDecimal orderAmount);
    

    BigDecimal applyCoupon(Integer orderId, String couponCode);
    

    void removeCouponFromOrder(Integer orderId, Integer couponId);
    

    BigDecimal calculateDiscount(String couponCode, BigDecimal orderAmount);
    

    void synchronizeCouponUsage(Integer couponId);
    

    void synchronizeAllCouponsUsage();
} 