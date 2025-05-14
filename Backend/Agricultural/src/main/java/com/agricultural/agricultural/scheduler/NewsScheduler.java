package com.agricultural.agricultural.scheduler;

import com.agricultural.agricultural.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsScheduler {

    private final NewsService newsService;

    /**
     * Tự động thu thập tin tức từ tất cả các nguồn được kích hoạt mỗi 6 giờ
     */
    @Scheduled(cron = "0 0 */6 * * *") // Chạy vào 0 giây, 0 phút, mỗi 6 giờ
    public void scheduledNewsFetching() {
        log.info("Starting scheduled news fetching task");
        try {
            newsService.fetchNewsFromSources();
            log.info("Completed scheduled news fetching task");
        } catch (Exception e) {
            log.error("Error in scheduled news fetching task", e);
        }
    }
} 