package com.agricultural.agricultural.config;

import com.agricultural.agricultural.entity.NewsSource;
import com.agricultural.agricultural.repository.NewsSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class NewsScraperConfig {

    private final NewsSourceRepository newsSourceRepository;

    @PostConstruct
    public void init() {
        updateNewsSourcesConfiguration();
    }

    private void updateNewsSourcesConfiguration() {
        log.info("Cập nhật cấu hình crawling cho các nguồn tin tức...");
        
        // Cập nhật nguồn tin Dân Việt
        updateDanVietSource();
        
        // Cập nhật nguồn tin Nông Nghiệp Việt Nam
        updateNongNghiepSource();
        
        // Cập nhật nguồn tin Báo Mới
        updateBaoMoiSource();
        
        // Cập nhật nguồn tin VietnamNet
        updateVietnamNetSource();
        
        log.info("Hoàn tất cập nhật cấu hình crawling.");
    }
    
    private void updateDanVietSource() {
        List<NewsSource> danVietSources = newsSourceRepository.findByNameContainingIgnoreCase("Dân Việt");
        for (NewsSource source : danVietSources) {
            // Cập nhật URL nếu cần (đôi khi URL có thể thay đổi định dạng)
            if (source.getUrl().contains(".htm")) {
                source.setUrl("https://danviet.vn/nong-nghiep.html");
            }
            
            // Cập nhật các selectors để phù hợp với cấu trúc HTML mới
            source.setArticleSelector(".list-news .news-item, .list-news-home .item, article.story, div.item-news");
            source.setTitleSelector("h1.title-detail, .title h1, .detail-title");
            source.setSummarySelector("h2.sapo, .detail-sapo, .sapo");
            source.setContentSelector("div.detail-content, .content-news");
            source.setImageSelector(".detail-content img, .content-news img");
            source.setDateSelector(".time-detail, p.time-detail");
            
            newsSourceRepository.save(source);
            log.info("Đã cập nhật nguồn tin Dân Việt: {}", source.getName());
        }
    }
    
    private void updateNongNghiepSource() {
        List<NewsSource> nongnghiepSources = newsSourceRepository.findByNameContainingIgnoreCase("Nông Nghiệp");
        for (NewsSource source : nongnghiepSources) {
            // Cập nhật các selectors
            source.setArticleSelector(".cate-list .story, article.story, .list-news .story, .item-news");
            source.setTitleSelector("h1.detail-title, .article-title h1");
            source.setSummarySelector("h2.detail-sapo, .article-sapo");
            source.setContentSelector("div.detail-content, .article-content");
            source.setImageSelector(".detail-content figure img, .article-content img");
            source.setDateSelector("p.detail-time, .detail-time");
            
            newsSourceRepository.save(source);
            log.info("Đã cập nhật nguồn tin Nông Nghiệp: {}", source.getName());
        }
    }
    
    private void updateBaoMoiSource() {
        List<NewsSource> baomoiSources = newsSourceRepository.findByNameContainingIgnoreCase("Báo Mới");
        for (NewsSource source : baomoiSources) {
            // Cập nhật URL, baomoi.com đã thay đổi cấu trúc URL
            source.setUrl("https://baomoi.com/nong-nghiep/t-5916996.epi");
            
            // Cập nhật các selectors
            source.setArticleSelector(".bm_F .bm_S, .story-item, .bm_s");
            source.setTitleSelector("h1.article__header, .content-detail-title, h1.title");
            source.setSummarySelector("h2.article__sapo, .content-detail-sapo, .sapo");
            source.setContentSelector("div.article__body, .content-detail-body, .body");
            source.setImageSelector(".article__body img, .content-detail-body img");
            source.setDateSelector("div.article__meta time, .content-detail-time");
            
            newsSourceRepository.save(source);
            log.info("Đã cập nhật nguồn tin Báo Mới: {}", source.getName());
        }
    }
    
    private void updateVietnamNetSource() {
        List<NewsSource> vietnamnetSources = newsSourceRepository.findByNameContainingIgnoreCase("VietNamNet");
        for (NewsSource source : vietnamnetSources) {
            // Cập nhật URL nếu cần
            if (!source.getUrl().contains("kinh-doanh/nong-nghiep")) {
                source.setUrl("https://vietnamnet.vn/kinh-doanh/nong-nghiep");
            }
            
            // Cập nhật các selectors
            source.setArticleSelector(".box-item-post, .item-news, div.item-news, .item");
            source.setTitleSelector("h1.content-detail-title, .title-detail h1");
            source.setSummarySelector("p.content-detail-sapo, .sapo-detail");
            source.setContentSelector("div.content-detail-body, .detail-body");
            source.setImageSelector(".content-detail-body img, .detail-body img");
            source.setDateSelector("span.content-detail-time, .time-detail");
            
            newsSourceRepository.save(source);
            log.info("Đã cập nhật nguồn tin VietnamNet: {}", source.getName());
        }
    }
} 