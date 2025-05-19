package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.NewsSourceDTO;
import com.agricultural.agricultural.entity.NewsSource;
import com.agricultural.agricultural.repository.NewsSourceRepository;
import com.agricultural.agricultural.service.NewsSourceService;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/news-sources")
@RequiredArgsConstructor
public class NewsSourceController {

    private final NewsSourceService newsSourceService;
    private final NewsSourceRepository newsSourceRepository;

    @GetMapping
    public ResponseEntity<List<NewsSourceDTO>> getAllNewsSources() {
        return ResponseEntity.ok(newsSourceService.getAllNewsSources());
    }

    @GetMapping("/active")
    public ResponseEntity<List<NewsSourceDTO>> getActiveNewsSources() {
        return ResponseEntity.ok(newsSourceService.getActiveNewsSources());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<NewsSourceDTO>> getNewsSourcesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(newsSourceService.getNewsSourcesByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsSourceDTO> getNewsSourceById(@PathVariable Long id) {
        return ResponseEntity.ok(newsSourceService.getNewsSourceById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<NewsSourceDTO> createNewsSource(@RequestBody NewsSourceDTO newsSourceDTO) {
        NewsSourceDTO createdSource = newsSourceService.createNewsSource(newsSourceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSource);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<NewsSourceDTO> updateNewsSource(@PathVariable Long id, @RequestBody NewsSourceDTO newsSourceDTO) {
        NewsSourceDTO updatedSource = newsSourceService.updateNewsSource(id, newsSourceDTO);
        return ResponseEntity.ok(updatedSource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> deleteNewsSource(@PathVariable Long id) {
        newsSourceService.deleteNewsSource(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> activateNewsSource(@PathVariable Long id) {
        newsSourceService.activateNewsSource(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> deactivateNewsSource(@PathVariable Long id) {
        newsSourceService.deactivateNewsSource(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update-url")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<String> updateNewsSourceUrl(@RequestParam("id") Long id, @RequestParam("url") String url) {
        try {
            NewsSourceDTO source = newsSourceService.getNewsSourceById(id);
            source.setUrl(url);
            newsSourceService.updateNewsSource(id, source);
            return ResponseEntity.ok("Đã cập nhật URL thành công cho nguồn tin có ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi cập nhật URL: " + e.getMessage());
        }
    }

    @PostMapping("/create-default-sources")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> createDefaultSources() {
        // Kiểm tra xem đã có nguồn tin nào chưa
        long count = newsSourceRepository.count();
        if (count > 0) {
            return ResponseEntity.ok("Đã có nguồn tin trong database, không cần tạo mặc định");
        }
        
        // Tạo các nguồn tin mặc định
        NewsSource source1 = NewsSource.builder()
                .name("Báo Nông Nghiệp Việt Nam")
                .url("https://nongnghiep.vn/nong-nghiep/")
                .articleSelector(".item, .story-item, article, .story, .post, .entry, .news-item, .box-news, .list-news li, .list-content article")
                .titleSelector("h1.title, h1.detail-title, h1.article-title, h1.entry-title, .detail-title, .article-title, .title-detail")
                .summarySelector("h2.sapo, .detail-sapo, .article-sapo, .sapo, .excerpt, .summary, .news-sapo")
                .contentSelector(".detail-content, .article-content, .content-detail, .detail-text-body, .entry-content")
                .imageSelector(".detail-content img, .article-content img, .post-content img, .article-avatar img, .featured-image img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source2 = NewsSource.builder()
                .name("VietNamNet - Nông Nghiệp")
                .url("https://vietnamnet.vn/kinh-doanh/nong-san")
                .articleSelector(".box-item-post, .item-news, .vnn-content-card, .vnn-card-3")
                .titleSelector("h1.content-detail-title, .content-detail__title, .title-detail")
                .summarySelector(".content-detail-sapo, .sapo, .article-sapo")
                .contentSelector(".content-detail-body, .article-body, .detail-content")
                .imageSelector(".fig-picture img, .content-img img, .vnn-img img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source3 = NewsSource.builder()
                .name("Dân Việt - Nông Nghiệp")
                .url("https://danviet.vn/nong-nghiep.htm")
                .articleSelector(".box-category-item .story-item, .story, .list-news-top article, .list-news article, .list-news-home .item")
                .titleSelector("h1.title-detail, h1.title")
                .summarySelector(".sapo, .detail-sapo")
                .contentSelector(".detail-content, .detail-content-body")
                .imageSelector(".fig-picture img, .detail-content img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source4 = NewsSource.builder()
                .name("Báo Mới - Nông Nghiệp")
                .url("https://baomoi.com/nong-nghiep.epi")
                .articleSelector(".bm_S")
                .titleSelector("h1.article__header")
                .summarySelector(".article__sapo")
                .contentSelector(".article__body")
                .imageSelector(".article__body img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source5 = NewsSource.builder()
                .name("CafeF - Nông Nghiệp")
                .url("https://cafef.vn/nong-nghiep.chn")
                .articleSelector(".knswli")
                .titleSelector("h1.title")
                .summarySelector(".sapo")
                .contentSelector(".detail-content")
                .imageSelector(".detail-content img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source6 = NewsSource.builder()
                .name("Nhân Dân - Nông Nghiệp")
                .url("https://nhandan.vn/nong-nghiep")
                .articleSelector(".item-news")
                .titleSelector("h1.article-title")
                .summarySelector(".article-sapo")
                .contentSelector(".article-content")
                .imageSelector(".article-content img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source7 = NewsSource.builder()
                .name("Báo Chính Phủ - Nông Nghiệp")
                .url("https://baochinhphu.vn/nong-nghiep")
                .articleSelector(".news-card")
                .titleSelector("h1.detail-title")
                .summarySelector(".article-summary")
                .contentSelector(".detail-content")
                .imageSelector(".detail-content img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source8 = NewsSource.builder()
                .name("Nông Nghiệp Sạch")
                .url("https://nongnghiepsach.com.vn/tin-tuc-nong-nghiep-n11.html")
                .articleSelector(".list-news-item")
                .titleSelector("h1.title-detail")
                .summarySelector(".description-detail")
                .contentSelector(".content-detail")
                .imageSelector(".content-detail img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        NewsSource source9 = NewsSource.builder()
                .name("Báo Nông Thôn Ngày Nay")
                .url("https://nongthonngaynay.vn/nong-nghiep-toan-dien-tag")
                .articleSelector(".story-item")
                .titleSelector("h1.detail-title")
                .summarySelector(".detail-sapo")
                .contentSelector(".detail-content")
                .imageSelector(".detail-content img")
                .category("Nông nghiệp")
                .active(true)
                .build();
        
        // Thêm nguồn tin về thủy sản
        NewsSource source10 = NewsSource.builder()
                .name("Thủy Sản Việt Nam")
                .url("https://thuysanvietnam.com.vn/category/tin-tuc/")
                .articleSelector(".news-list-item")
                .titleSelector("h1.entry-title")
                .summarySelector(".entry-summary")
                .contentSelector(".entry-content")
                .imageSelector(".entry-content img")
                .category("Thủy sản")
                .active(true)
                .build();
        
        // Thêm nguồn tin về chăn nuôi  
        NewsSource source11 = NewsSource.builder()
                .name("Chăn Nuôi Việt Nam")
                .url("https://nhachannuoi.vn/tin-tuc/")
                .articleSelector(".post-item")
                .titleSelector("h1.post-title")
                .summarySelector(".post-excerpt")
                .contentSelector(".post-content")
                .imageSelector(".post-content img")
                .category("Chăn nuôi")
                .active(true)
                .build();
        
        // Thêm nguồn tin về thị trường nông sản
        NewsSource source12 = NewsSource.builder()
                .name("Thị Trường Nông Sản")
                .url("https://thitruongnongsan.com/tin-tuc-nong-san")
                .articleSelector(".news-list-item")
                .titleSelector("h1.news-title")
                .summarySelector(".news-summary")
                .contentSelector(".news-content")
                .imageSelector(".news-content img")
                .category("Thị trường")
                .active(true)
                .build();
        
        // Lưu các nguồn tin
        newsSourceRepository.save(source1);
        newsSourceRepository.save(source2);
        newsSourceRepository.save(source3);
        newsSourceRepository.save(source4);
        newsSourceRepository.save(source5);
        newsSourceRepository.save(source6);
        newsSourceRepository.save(source7);
        newsSourceRepository.save(source8);
        newsSourceRepository.save(source9);
        newsSourceRepository.save(source10);
        newsSourceRepository.save(source11);
        newsSourceRepository.save(source12);
        
        return ResponseEntity.ok("Đã tạo 12 nguồn tin cho nhiều chủ đề khác nhau");
    }

    @PostMapping("/{id}/test-selectors")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> testAndUpdateSelectors(@PathVariable Long id) {
        try {
            Optional<NewsSource> optionalSource = newsSourceRepository.findById(id);
            if (optionalSource.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            NewsSource source = optionalSource.get();
            String url = source.getUrl();
            
            // Try to connect to the source URL
            String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
            
            Document doc;
            try {
                doc = Jsoup.connect(url)
                        .userAgent(userAgent)
                        .timeout(15000)
                        .get();
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Không thể kết nối đến URL: " + url + ". Lỗi: " + e.getMessage());
            }
            
            // Test article selector
            Elements articleElements = doc.select(source.getArticleSelector());
            if (articleElements.isEmpty()) {
                // Try to find better article selector
                String[] commonArticleSelectors = {
                    "article", ".article", ".story-item", ".news-item", ".item", 
                    ".cate-list .st", ".item-news", ".list-news article", ".list-news .item", 
                    ".news-card", ".card", ".story", ".entry", ".vnn-card", ".post"
                };
                
                String bestArticleSelector = null;
                int maxFound = 0;
                
                for (String selector : commonArticleSelectors) {
                    Elements found = doc.select(selector);
                    if (found.size() > maxFound) {
                        maxFound = found.size();
                        bestArticleSelector = selector;
                    }
                }
                
                if (bestArticleSelector != null) {
                    source.setArticleSelector(bestArticleSelector);
                }
            }
            
            // Test an article page
            Elements links = doc.select("a[href]");
            if (!links.isEmpty()) {
                for (Element link : links) {
                    String href = link.attr("abs:href");
                    if (href.contains(source.getUrl().replace("http://", "").replace("https://", "").split("/")[0])) {
                        try {
                            Document articleDoc = Jsoup.connect(href)
                                    .userAgent(userAgent)
                                    .timeout(15000)
                                    .get();
                            
                            // Test title selector
                            Element titleEl = articleDoc.selectFirst(source.getTitleSelector());
                            if (titleEl == null) {
                                String[] commonTitleSelectors = {
                                    "h1.title", "h1.detail-title", "h1.article-title", 
                                    "h1.content-detail-title", ".title-detail", ".article-title", 
                                    ".post-title", "h1.title-news", "h1"
                                };
                                
                                for (String selector : commonTitleSelectors) {
                                    Element found = articleDoc.selectFirst(selector);
                                    if (found != null) {
                                        source.setTitleSelector(selector);
                                        break;
                                    }
                                }
                            }
                            
                            // Test summary selector
                            Element summaryEl = articleDoc.selectFirst(source.getSummarySelector());
                            if (summaryEl == null) {
                                String[] commonSummarySelectors = {
                                    "h2.sapo", ".detail-sapo", ".article-sapo", ".sapo", 
                                    ".summary", ".article-summary", ".post-excerpt", 
                                    ".content-detail-sapo", ".description-detail"
                                };
                                
                                for (String selector : commonSummarySelectors) {
                                    Element found = articleDoc.selectFirst(selector);
                                    if (found != null) {
                                        source.setSummarySelector(selector);
                                        break;
                                    }
                                }
                            }
                            
                            // Test content selector
                            Element contentEl = articleDoc.selectFirst(source.getContentSelector());
                            if (contentEl == null) {
                                String[] commonContentSelectors = {
                                    ".detail-content", ".article-content", ".content-detail", 
                                    ".article-body", ".entry-content", ".post-content", 
                                    ".content-detail-body", ".news-content", ".content"
                                };
                                
                                for (String selector : commonContentSelectors) {
                                    Element found = articleDoc.selectFirst(selector);
                                    if (found != null && found.text().length() > 200) {
                                        source.setContentSelector(selector);
                                        break;
                                    }
                                }
                            }
                            
                            // Test image selector
                            Element imageEl = articleDoc.selectFirst(source.getImageSelector());
                            if (imageEl == null) {
                                String[] commonImageSelectors = {
                                    ".detail-content img", ".article-content img", ".content-detail img", 
                                    ".article-body img", ".entry-content img", ".post-content img", 
                                    ".fig-picture img", ".main-img img", ".featured-img img", 
                                    ".detail-img img", "article img", "img.article-image"
                                };
                                
                                for (String selector : commonImageSelectors) {
                                    Elements found = articleDoc.select(selector);
                                    if (!found.isEmpty()) {
                                        source.setImageSelector(selector);
                                        break;
                                    }
                                }
                            }
                            
                            // Test date selector
                            if (source.getDateSelector() == null || source.getDateSelector().isEmpty()) {
                                String[] commonDateSelectors = {
                                    ".time", ".date", ".datetime", ".published-date", ".post-date", ".article-date", 
                                    ".news-date", ".entry-date", ".time-public", ".date-time", ".time-info",
                                    "time", "[itemprop=datePublished]", ".article-time", ".news-time", ".publish-time",
                                    ".detail-time", ".article-meta time", ".time-update", ".post-meta time"
                                };
                                
                                for (String selector : commonDateSelectors) {
                                    Element found = articleDoc.selectFirst(selector);
                                    if (found != null && !found.text().trim().isEmpty()) {
                                        source.setDateSelector(selector);
                                        
                                        // Try to detect date format
                                        String dateText = found.text().trim();
                                        if (!dateText.isEmpty()) {
                                            String detectedFormat = detectDateFormat(dateText);
                                            if (detectedFormat != null) {
                                                source.setDateFormat(detectedFormat);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            
                            // Break after first successful article test
                            break;
                        } catch (Exception e) {
                            // Continue to next link
                        }
                    }
                }
            }
            
            // Save updated selectors
            newsSourceRepository.save(source);
            
            return ResponseEntity.ok(
                Map.of(
                    "message", "Đã kiểm tra và cập nhật bộ chọn CSS cho nguồn tin: " + source.getName(),
                    "source", source
                )
            );
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi kiểm tra bộ chọn CSS: " + e.getMessage());
        }
    }

    /**
     * Detect common date format from a sample date string
     */
    private String detectDateFormat(String dateText) {
        // Remove common prefixes like "Cập nhật:" or "Đăng:"
        dateText = dateText.replaceAll("(?i)(Cập nhật|Đăng|Ngày đăng|Đăng ngày|Đăng lúc|Xuất bản|Ngày xuất bản|Ngày)\\s*:?\\s*", "").trim();
        
        // Common Vietnamese formats
        if (dateText.matches("\\d{1,2}/\\d{1,2}/\\d{4}\\s+\\d{1,2}:\\d{2}")) {
            return "dd/MM/yyyy HH:mm";
        } else if (dateText.matches("\\d{1,2}-\\d{1,2}-\\d{4}\\s+\\d{1,2}:\\d{2}")) {
            return "dd-MM-yyyy HH:mm";
        } else if (dateText.matches("\\d{1,2}/\\d{1,2}/\\d{4}")) {
            return "dd/MM/yyyy";
        } else if (dateText.matches("\\d{1,2}-\\d{1,2}-\\d{4}")) {
            return "dd-MM-yyyy";
        } else if (dateText.matches("\\d{4}-\\d{1,2}-\\d{1,2}\\s+\\d{1,2}:\\d{2}")) {
            return "yyyy-MM-dd HH:mm";
        } else if (dateText.matches("\\d{4}-\\d{1,2}-\\d{1,2}")) {
            return "yyyy-MM-dd";
        } else if (dateText.matches("\\d{1,2}:\\d{2}\\s+-\\s+\\d{1,2}/\\d{1,2}/\\d{4}")) {
            return "HH:mm - dd/MM/yyyy";
        }
        
        // For complex Vietnamese text formats, return null and let the extraction method handle it
        return null;
    }

    @PostMapping("/update-all-date-selectors")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateAllDateSelectors() {
        try {
            List<NewsSource> activeSources = newsSourceRepository.findAllByActiveTrue();
            
            if (activeSources.isEmpty()) {
                return ResponseEntity.ok("Không tìm thấy nguồn tin nào đang hoạt động");
            }
            
            int updatedCount = 0;
            List<String> updatedSources = new ArrayList<>();
            
            for (NewsSource source : activeSources) {
                try {
                    String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
                    
                    // Fetch the main page
                    Document doc = Jsoup.connect(source.getUrl())
                            .userAgent(userAgent)
                            .timeout(15000)
                            .get();
                    
                    // Get the first article link
                    Elements articleElements = doc.select(source.getArticleSelector());
                    if (articleElements.isEmpty()) {
                        continue;
                    }
                    
                    // Extract the article URL
                    String articleUrl = null;
                    for (Element article : articleElements) {
                        Element link = article.selectFirst("a[href]");
                        if (link != null) {
                            String href = link.attr("abs:href");
                            if (href != null && !href.isEmpty()) {
                                articleUrl = href;
                                break;
                            }
                        }
                    }
                    
                    if (articleUrl == null) {
                        continue;
                    }
                    
                    // Fetch the article page
                    Document articleDoc = Jsoup.connect(articleUrl)
                            .userAgent(userAgent)
                            .timeout(15000)
                            .get();
                    
                    // Test date selector
                    String[] commonDateSelectors = {
                        ".time", ".date", ".datetime", ".published-date", ".post-date", ".article-date", 
                        ".news-date", ".entry-date", ".time-public", ".date-time", ".time-info",
                        "time", "[itemprop=datePublished]", ".article-time", ".news-time", ".publish-time",
                        ".detail-time", ".article-meta time", ".time-update", ".post-meta time"
                    };
                    
                    boolean dateFound = false;
                    for (String selector : commonDateSelectors) {
                        Element found = articleDoc.selectFirst(selector);
                        if (found != null && !found.text().trim().isEmpty()) {
                            source.setDateSelector(selector);
                            
                            // Try to detect date format
                            String dateText = found.text().trim();
                            if (!dateText.isEmpty()) {
                                String detectedFormat = detectDateFormat(dateText);
                                if (detectedFormat != null) {
                                    source.setDateFormat(detectedFormat);
                                }
                            }
                            
                            dateFound = true;
                            break;
                        }
                    }
                    
                    if (dateFound) {
                        newsSourceRepository.save(source);
                        updatedCount++;
                        updatedSources.add(source.getName());
                    }
                    
                } catch (Exception e) {
                    // Continue with next source
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã cập nhật bộ chọn ngày cho " + updatedCount + " nguồn tin",
                "updatedSources", updatedSources
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật bộ chọn ngày: " + e.getMessage());
        }
    }
} 