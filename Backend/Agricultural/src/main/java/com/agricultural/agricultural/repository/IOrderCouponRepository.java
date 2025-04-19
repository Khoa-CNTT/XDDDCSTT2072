package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.OrderCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IOrderCouponRepository extends JpaRepository<OrderCoupon, Integer> {
    // Tìm các coupon đã áp dụng cho một đơn hàng
    List<OrderCoupon> findByOrderId(Integer orderId);
    
    // Đếm số lần sử dụng của một coupon
    @Query("SELECT COUNT(oc) FROM OrderCoupon oc WHERE oc.couponId = :couponId")
    Integer countByCouponId(@Param("couponId") Integer couponId);
    
    // Kiểm tra xem một coupon đã được áp dụng cho đơn hàng chưa
    boolean existsByOrderIdAndCouponId(Integer orderId, Integer couponId);
    
    // Tìm OrderCoupon theo orderId và couponId
    Optional<OrderCoupon> findByOrderIdAndCouponId(Integer orderId, Integer couponId);
}