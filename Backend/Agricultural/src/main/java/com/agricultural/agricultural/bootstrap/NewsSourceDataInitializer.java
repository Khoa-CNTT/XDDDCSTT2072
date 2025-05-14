package com.agricultural.agricultural.bootstrap;

import com.agricultural.agricultural.entity.NewsSource;
import com.agricultural.agricultural.repository.NewsSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsSourceDataInitializer implements CommandLineRunner {

    private final NewsSourceRepository newsSourceRepository;

    @Override
    public void run(String... args) throws Exception {
        long count = newsSourceRepository.count();
        if (count == 0) {
            log.info("Initializing news sources data");
            initializeNewsSources();
        } else {
            log.info("News sources data already exists, skipping initialization");
        }
    }

    private void initializeNewsSources() {
        List<NewsSource> sources = Arrays.asList(
                // NONGNGHIEP.VN
                NewsSource.builder()
                        .name("Báo Nông Nghiệp Việt Nam")
                        .url("https://nongnghiep.vn/nong-nghiep/")
                        .articleSelector("article.story")
                        .titleSelector("h1.detail-title")
                        .summarySelector("h2.detail-sapo")
                        .contentSelector("div.detail-content")
                        .imageSelector("div.detail-content figure img")
                        .dateSelector("p.detail-time")
                        .dateFormat("dd/MM/yyyy HH:mm")
                        .category("Nông nghiệp")
                        .active(true)
                        .build(),
                
                // BAOMOI.COM - Nông Nghiệp
                NewsSource.builder()
                        .name("Báo Mới - Nông Nghiệp")
                        .url("https://baomoi.com/nong-nghiep.top")
                        .articleSelector("div.bm_S")
                        .titleSelector("h1.article__header")
                        .summarySelector("h2.article__sapo")
                        .contentSelector("div.article__body")
                        .imageSelector("div.article__body img")
                        .dateSelector("div.article__meta time")
                        .category("Nông nghiệp")
                        .active(true)
                        .build(),
                
                // VIETNAMNET.VN - Nông Nghiệp
                NewsSource.builder()
                        .name("VietNamNet - Nông Nghiệp")
                        .url("https://vietnamnet.vn/kinh-doanh/nong-nghiep")
                        .articleSelector("div.item-news")
                        .titleSelector("h1.content-detail-title")
                        .summarySelector("p.content-detail-sapo")
                        .contentSelector("div.content-detail-body")
                        .imageSelector("div.content-detail-body img")
                        .dateSelector("span.content-detail-time")
                        .category("Nông nghiệp")
                        .active(true)
                        .build(),
                
                // DANVIET.VN - Nông Nghiệp
                NewsSource.builder()
                        .name("Dân Việt - Nông Nghiệp")
                        .url("https://danviet.vn/nong-nghiep.htm")
                        .articleSelector("li.item-news")
                        .titleSelector("h1.title-detail")
                        .summarySelector("h2.sapo")
                        .contentSelector("div.detail-content")
                        .imageSelector("div.detail-content img")
                        .dateSelector("p.time-detail")
                        .category("Nông nghiệp")
                        .active(true)
                        .build()
        );

        newsSourceRepository.saveAll(sources);
        log.info("Saved {} news sources", sources.size());
    }
}