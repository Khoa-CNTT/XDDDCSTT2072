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
import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;

@Repository
public interface ICouponRepository extends JpaRepository<Coupon, Integer> {
    Optional<Coupon> findByCode(String code);
    
    boolean existsByCode(String code);
    
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now")
    List<Coupon> findAllActiveCoupons(@Param("status") CouponStatus status, @Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now " +
           "AND ((c.productSpecific = true AND c.specificProductId = :productId) OR c.productSpecific = false)")
    List<Coupon> findCouponsForProduct(@Param("status") CouponStatus status, @Param("productId") Integer productId, @Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now " +
           "AND ((c.categorySpecific = true AND c.specificCategoryId = :categoryId) OR c.categorySpecific = false)")
    List<Coupon> findCouponsForCategory(@Param("status") CouponStatus status, @Param("categoryId") Integer categoryId, @Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now " +
           "AND ((c.userSpecific = true AND c.specificUserId = :userId) OR c.userSpecific = false)")
    List<Coupon> findCouponsForUser(@Param("status") CouponStatus status, @Param("userId") Integer userId, @Param("now") LocalDateTime now);
    
    List<Coupon> findByStatusAndEndDateBefore(CouponStatus status, LocalDateTime endDate);
    
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.usageLimit IS NOT NULL AND c.usageCount >= c.usageLimit")
    List<Coupon> findByStatusAndUsageLimitNotNullAndUsageCountGreaterThanEqual(@Param("status") CouponStatus status);
    
    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.startDate <= :now AND c.endDate >= :now " +
           "AND c.minOrderValue <= :orderAmount " +
           "AND (c.userSpecific = false OR (c.userSpecific = true AND c.specificUserId = :userId)) " +
           "ORDER BY " +
           "CASE WHEN c.type = 'PERCENTAGE' THEN c.discountPercentage * :orderAmount / 100 " +
           "     WHEN c.type = 'FIXED' THEN c.maxDiscount " +
           "     ELSE 0 END DESC")
    List<Coupon> findBestCouponsForUserAndAmount(
            @Param("status") CouponStatus status, 
            @Param("userId") Integer userId, 
            @Param("orderAmount") BigDecimal orderAmount, 
            @Param("now") LocalDateTime now, 
            Pageable pageable);
} 