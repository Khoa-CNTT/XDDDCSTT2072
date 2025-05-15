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
    
    // Kiểm tra xem một người dùng (buyerId) đã từng sử dụng coupon chưa
    @Query(value = "SELECT EXISTS (SELECT 1 FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE o.buyer_id = :buyerId AND oc.coupon_id = :couponId)", nativeQuery = true)
    boolean existsByBuyerIdAndCouponId(@Param("buyerId") Integer buyerId, @Param("couponId") Integer couponId);
    
    // Đếm số người dùng khác nhau đã sử dụng coupon này
    @Query(value = "SELECT COUNT(DISTINCT o.buyer_id) FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE oc.coupon_id = :couponId AND o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED')", nativeQuery = true)
    Integer countDistinctUsersByCouponId(@Param("couponId") Integer couponId);
    
    // Đếm tất cả đơn hàng có sử dụng mã giảm giá, kể cả trạng thái PENDING
    @Query(value = "SELECT COUNT(DISTINCT o.buyer_id) FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE oc.coupon_id = :couponId", nativeQuery = true)
    Integer countAllDistinctUsersByCouponId(@Param("couponId") Integer couponId);
    
    // Lấy danh sách buyer_id và trạng thái của đơn hàng đã sử dụng coupon
    @Query(value = "SELECT o.buyer_id, o.status FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE oc.coupon_id = :couponId", nativeQuery = true)
    List<Object[]> findBuyerIdsAndStatusByCouponId(@Param("couponId") Integer couponId);
}