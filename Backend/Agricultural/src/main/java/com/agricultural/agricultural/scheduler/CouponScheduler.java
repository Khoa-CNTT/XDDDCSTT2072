package com.agricultural.agricultural.scheduler;

import com.agricultural.agricultural.entity.Coupon;
import com.agricultural.agricultural.repository.ICouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CouponScheduler {

    private final ICouponRepository couponRepository;

    /**
     * Cập nhật trạng thái mã giảm giá mỗi ngày vào lúc 1 giờ sáng
     * - Chuyển trạng thái các mã hết hạn thành 'expired'
     * - Chuyển trạng thái các mã đã sử dụng hết số lượng thành 'expired'
     */
    @Scheduled(cron = "0 0 1 * * ?") // Chạy lúc 1:00 AM mỗi ngày
    @Transactional
    public void updateCouponStatus() {
        log.info("Bắt đầu cập nhật trạng thái mã giảm giá");
        LocalDateTime now = LocalDateTime.now();
        int updatedCount = 0;

        // Cập nhật trạng thái mã giảm giá hết hạn
        List<Coupon> expiredCoupons = couponRepository.findByStatusAndEndDateBefore(
                Coupon.CouponStatus.active, now);
        
        for (Coupon coupon : expiredCoupons) {
            coupon.setStatus(Coupon.CouponStatus.expired);
            couponRepository.save(coupon);
            updatedCount++;
        }

        // Cập nhật trạng thái mã giảm giá đã sử dụng hết
        List<Coupon> fullyUsedCoupons = couponRepository.findByStatusAndUsageLimitNotNullAndUsageCountGreaterThanEqual(
                Coupon.CouponStatus.active);
        
        for (Coupon coupon : fullyUsedCoupons) {
            coupon.setStatus(Coupon.CouponStatus.expired);
            couponRepository.save(coupon);
            updatedCount++;
        }
        
        log.info("Đã cập nhật {} mã giảm giá thành trạng thái 'expired'", updatedCount);
    }
} 