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
     * Tự động thu thập tin tức từ tất cả các nguồn được kích hoạt mỗi giờ
     * Cron: [Giây] [Phút] [Giờ] [Ngày trong tháng] [Tháng] [Ngày trong tuần]
     */
    @Scheduled(cron = "0 0 */1 * * *") // Chạy vào 0 giây, 0 phút, mỗi 1 giờ
    public void scheduledNewsFetching() {
        log.info("Starting scheduled news fetching task");
        try {
            long beforeCount = newsService.getNewsCount();
            newsService.fetchNewsFromSources();
            long afterCount = newsService.getNewsCount();
            long newArticles = afterCount - beforeCount;
            
            if (newArticles > 0) {
                log.info("Completed scheduled news fetching task. Added {} new articles", newArticles);
            } else {
                log.info("Completed scheduled news fetching task. No new articles found");
            }
        } catch (Exception e) {
            log.error("Error in scheduled news fetching task", e);
        }
    }
} 