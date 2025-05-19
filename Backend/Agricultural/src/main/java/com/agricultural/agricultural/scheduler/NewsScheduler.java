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

    @Scheduled(cron = "0 0 */1 * * *") // Chạy mỗi giờ
    public void thuThapTinTucTheoLich() {
        log.info("Bắt đầu tác vụ thu thập tin tức theo lịch");
        try {
            long soLuongTruoc = newsService.getNewsCount();
            newsService.fetchNewsFromSources();
            long soLuongSau = newsService.getNewsCount();
            long soTinMoi = soLuongSau - soLuongTruoc;

            if (soTinMoi > 0) {
                log.info("Hoàn thành thu thập tin tức. Đã thêm {} bài viết mới", soTinMoi);
            } else {
                log.info("Hoàn thành thu thập tin tức. Không có bài viết mới");
            }
        } catch (Exception e) {
            log.error("Lỗi khi thực hiện thu thập tin tức theo lịch", e);
        }
    }
}
