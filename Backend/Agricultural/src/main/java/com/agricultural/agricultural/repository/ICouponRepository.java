package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Coupon;
import com.agricultural.agricultural.entity.Coupon.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ICouponRepository extends JpaRepository<Coupon, Integer> {
    // Tìm coupon theo mã
    Optional<Coupon> findByCode(String code);
    
    // Kiểm tra mã coupon đã tồn tại chưa
    boolean existsByCode(String code);
    
    // Tìm tất cả coupon đang hoạt động
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now")
    List<Coupon> findAllActiveCoupons(@Param("status") CouponStatus status, @Param("now") LocalDateTime now);
    
    // Tìm coupon áp dụng cho sản phẩm cụ thể
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now " +
           "AND ((c.productSpecific = true AND c.specificProductId = :productId) OR c.productSpecific = false)")
    List<Coupon> findCouponsForProduct(@Param("status") CouponStatus status, @Param("productId") Integer productId, @Param("now") LocalDateTime now);
    
    // Tìm coupon áp dụng cho danh mục sản phẩm
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now " +
           "AND ((c.categorySpecific = true AND c.specificCategoryId = :categoryId) OR c.categorySpecific = false)")
    List<Coupon> findCouponsForCategory(@Param("status") CouponStatus status, @Param("categoryId") Integer categoryId, @Param("now") LocalDateTime now);
    
    // Tìm coupon áp dụng cho người dùng cụ thể
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now " +
           "AND ((c.userSpecific = true AND c.specificUserId = :userId) OR c.userSpecific = false)")
    List<Coupon> findCouponsForUser(@Param("status") CouponStatus status, @Param("userId") Integer userId, @Param("now") LocalDateTime now);
} 