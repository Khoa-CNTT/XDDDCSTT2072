package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IUserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    List<UserSubscription> findByUserId(Integer userId);
    
    @Query("SELECT s FROM UserSubscription s WHERE s.user.id = :userId AND s.isActive = true AND s.endDate > :now ORDER BY s.endDate DESC")
    List<UserSubscription> findActiveSubscriptionsByUserId(Integer userId, LocalDateTime now);
    
    Optional<UserSubscription> findFirstByUserIdAndIsActiveTrueAndEndDateGreaterThanOrderByEndDateDesc(Integer userId, LocalDateTime now);
    
    @Query("SELECT COUNT(s) FROM UserSubscription s WHERE s.user.id = :userId AND s.isActive = true AND s.endDate > :now")
    long countActiveSubscriptionsByUserId(Integer userId, LocalDateTime now);
    
    /**
     * Kiểm tra xem người dùng đã đăng ký một gói cụ thể nào đó chưa (bao gồm cả các gói đã hết hạn)
     */
    boolean existsByUserIdAndPlanId(Integer userId, Integer planId);
    
    /**
     * Kiểm tra xem người dùng đã có gói đăng ký đang hoạt động với gói nào đó chưa
     */
    @Query("SELECT COUNT(s) > 0 FROM UserSubscription s WHERE s.user.id = :userId AND s.plan.id = :planId AND s.isActive = true AND s.endDate > :now")
    boolean existsActiveSubscriptionByUserIdAndPlanId(Integer userId, Integer planId, LocalDateTime now);
} 