package com.agricultural.agricultural.scheduler;

import com.agricultural.agricultural.service.IProductRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler để cập nhật mô hình gợi ý sản phẩm
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationScheduler {

    private final IProductRecommendationService recommendationService;

    /**
     * Cập nhật mô hình gợi ý sản phẩm hàng ngày lúc 1:00 AM
     * Có thể điều chỉnh tần suất cập nhật tùy theo nhu cầu
     */
    @Scheduled(cron = "0 0 1 * * ?") // 1:00 AM mỗi ngày
    public void updateRecommendationModels() {
        log.info("Bắt đầu lịch trình cập nhật mô hình gợi ý sản phẩm");
        try {
            recommendationService.updateRecommendationModels();
            log.info("Cập nhật mô hình gợi ý sản phẩm thành công");
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật mô hình gợi ý sản phẩm: {}", e.getMessage(), e);
        }
    }
} 