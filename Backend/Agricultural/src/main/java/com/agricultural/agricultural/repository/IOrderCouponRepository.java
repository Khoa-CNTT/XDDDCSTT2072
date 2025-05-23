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
    List<OrderCoupon> findByOrderId(Integer orderId);
    
    @Query("SELECT COUNT(oc) FROM OrderCoupon oc WHERE oc.couponId = :couponId")
    Integer countByCouponId(@Param("couponId") Integer couponId);
    
    boolean existsByOrderIdAndCouponId(Integer orderId, Integer couponId);
    
    Optional<OrderCoupon> findByOrderIdAndCouponId(Integer orderId, Integer couponId);
    
    @Query(value = "SELECT EXISTS (SELECT 1 FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE o.buyer_id = :buyerId AND oc.coupon_id = :couponId)", nativeQuery = true)
    boolean existsByBuyerIdAndCouponId(@Param("buyerId") Integer buyerId, @Param("couponId") Integer couponId);
    
    @Query(value = "SELECT COUNT(DISTINCT o.buyer_id) FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE oc.coupon_id = :couponId AND o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED')", nativeQuery = true)
    Integer countDistinctUsersByCouponId(@Param("couponId") Integer couponId);
    
    @Query(value = "SELECT COUNT(DISTINCT o.buyer_id) FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE oc.coupon_id = :couponId", nativeQuery = true)
    Integer countAllDistinctUsersByCouponId(@Param("couponId") Integer couponId);
    
    @Query(value = "SELECT o.buyer_id, o.status FROM order_coupons oc JOIN orders o ON oc.order_id = o.id WHERE oc.coupon_id = :couponId", nativeQuery = true)
    List<Object[]> findBuyerIdsAndStatusByCouponId(@Param("couponId") Integer couponId);
}