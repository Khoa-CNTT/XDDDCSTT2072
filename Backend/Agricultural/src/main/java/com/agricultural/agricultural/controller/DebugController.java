package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.NewsSourceDTO;
import com.agricultural.agricultural.entity.NewsSource;
import com.agricultural.agricultural.repository.NewsRepository;
import com.agricultural.agricultural.repository.NewsSourceRepository;
import com.agricultural.agricultural.service.NewsService;
import com.agricultural.agricultural.service.NewsSourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("${api.prefix}/debug")
@RequiredArgsConstructor
public class DebugController {

    private final NewsSourceRepository newsSourceRepository;
    private final NewsRepository newsRepository;
    private final NewsService newsService;
    private final NewsSourceService newsSourceService;

    @GetMapping("/news-sources")
    public ResponseEntity<List<NewsSourceDTO>> getAllNewsSources() {
        return ResponseEntity.ok(newsSourceService.getAllNewsSources());
    }

    @GetMapping("/inspect-source/{id}")
    public ResponseEntity<?> inspectNewsSource(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Lấy thông tin nguồn tin
            NewsSource source = newsSourceRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nguồn tin với ID: " + id));
            
            result.put("source", source);
            
            // Thử kết nối với URL
            log.info("Thử kết nối với URL: {}", source.getUrl());
            String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
            
            Document doc = Jsoup.connect(source.getUrl())
                    .userAgent(userAgent)
                    .timeout(15000)
                    .get();
            
            result.put("pageTitle", doc.title());
            result.put("connectionSuccess", true);
            
            // Thử áp dụng selectors
            String articleSelector = source.getArticleSelector();
            Elements articles = doc.select(articleSelector);
            result.put("articleCount", articles.size());
            
            if (articles.isEmpty()) {
                // Thử các selectors phổ biến
                Map<String, Integer> selectorResults = new HashMap<>();
                String[] commonSelectors = {
                    ".story-item", ".cate-list .st", "article", ".item", ".news-item",
                    ".bm_F .bm_S", ".bm_B", ".story", ".item-news", ".list-content article",
                    ".box-item-post", ".list-news article", ".box-news"
                };
                
                for (String selector : commonSelectors) {
                    int count = doc.select(selector).size();
                    selectorResults.put(selector, count);
                }
                
                result.put("alternativeSelectors", selectorResults);
                
                // Đề xuất selector tốt nhất
                String bestSelector = null;
                int maxCount = 0;
                for (Map.Entry<String, Integer> entry : selectorResults.entrySet()) {
                    if (entry.getValue() > maxCount) {
                        maxCount = entry.getValue();
                        bestSelector = entry.getKey();
                    }
                }
                
                if (bestSelector != null && maxCount > 0) {
                    result.put("suggestedSelector", bestSelector);
                    result.put("suggestedCount", maxCount);
                    
                    // Tự động cập nhật selector
                    source.setArticleSelector(bestSelector);
                    newsSourceRepository.save(source);
                    result.put("selectorUpdated", true);
                    
                    // Kiểm tra lại với selector mới
                    articles = doc.select(bestSelector);
                    result.put("newArticleCount", articles.size());
                    
                    // Lấy URL của bài đầu tiên để kiểm tra
                    if (!articles.isEmpty()) {
                        Element firstArticle = articles.first();
                        Element link = firstArticle.select("a").first();
                        if (link != null) {
                            String href = link.attr("href");
                            if (!href.startsWith("http")) {
                                if (href.startsWith("/")) {
                                    java.net.URL url = new java.net.URL(source.getUrl());
                                    String domain = url.getProtocol() + "://" + url.getHost();
                                    href = domain + href;
                                } else {
                                    href = source.getUrl() + "/" + href;
                                }
                            }
                            result.put("sampleArticleUrl", href);
                            
                            // Thử tải bài viết
                            try {
                                Document articleDoc = Jsoup.connect(href)
                                        .userAgent(userAgent)
                                        .timeout(15000)
                                        .get();
                                
                                result.put("articleTitle", articleDoc.title());
                                
                                // Kiểm tra các selectors cho nội dung
                                Map<String, String> contentResults = new HashMap<>();
                                
                                if (source.getTitleSelector() != null) {
                                    String titleText = articleDoc.select(source.getTitleSelector()).text();
                                    contentResults.put("title", titleText);
                                }
                                
                                if (source.getContentSelector() != null) {
                                    String contentHtml = articleDoc.select(source.getContentSelector()).html();
                                    contentResults.put("content", contentHtml.substring(0, Math.min(contentHtml.length(), 200)) + "...");
                                }
                                
                                // Thử các selectors phổ biến cho nội dung nếu cần
                                if (contentResults.getOrDefault("content", "").isEmpty()) {
                                    String[] commonContentSelectors = {
                                        ".article-content", ".news-content", ".detail-content", 
                                        ".article-body", ".news-detail", ".content-news", 
                                        ".detail", ".content-detail", ".entry-content"
                                    };
                                    
                                    for (String selector : commonContentSelectors) {
                                        String contentHtml = articleDoc.select(selector).html();
                                        if (!contentHtml.isEmpty()) {
                                            contentResults.put("suggestedContentSelector", selector);
                                            contentResults.put("suggestedContent", contentHtml.substring(0, Math.min(contentHtml.length(), 200)) + "...");
                                            
                                            // Cập nhật selector nội dung nếu rỗng
                                            if (source.getContentSelector() == null || source.getContentSelector().isEmpty()) {
                                                source.setContentSelector(selector);
                                                newsSourceRepository.save(source);
                                                contentResults.put("contentSelectorUpdated", String.valueOf(true));
                                            }
                                            break;
                                        }
                                    }
                                }
                                
                                result.put("contentInspection", contentResults);
                                
                            } catch (Exception e) {
                                result.put("articleLoadError", e.getMessage());
                            }
                        }
                    }
                }
            } else {
                // Lấy thông tin của bài đầu tiên nếu có
                if (!articles.isEmpty()) {
                    Element firstArticle = articles.first();
                    result.put("firstArticleHtml", firstArticle.outerHtml());
                    
                    Element link = firstArticle.select("a").first();
                    if (link != null) {
                        String href = link.attr("href");
                        if (!href.startsWith("http")) {
                            if (href.startsWith("/")) {
                                java.net.URL url = new java.net.URL(source.getUrl());
                                String domain = url.getProtocol() + "://" + url.getHost();
                                href = domain + href;
                            } else {
                                href = source.getUrl() + "/" + href;
                            }
                        }
                        result.put("sampleArticleUrl", href);
                    }
                }
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            log.error("Lỗi khi kiểm tra nguồn tin: ", e);
            return ResponseEntity.ok(result);
        }
    }
    
    @GetMapping("/fix-all-sources")
    public ResponseEntity<?> fixAllSources() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<NewsSource> sources = newsSourceRepository.findAll();
            result.put("totalSources", sources.size());
            
            int updatedCount = 0;
            
            for (NewsSource source : sources) {
                try {
                    // Cập nhật selectors cho nguồn
                    boolean updated = updateSourceSelectors(source);
                    if (updated) {
                        updatedCount++;
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi cập nhật nguồn {}: {}", source.getName(), e.getMessage());
                }
            }
            
            result.put("updatedSources", updatedCount);
            
            // Cưỡng chế tải tin tức sau khi cập nhật
            newsService.forceFetchNewsFromSources();
            result.put("forceFetchStarted", true);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            log.error("Lỗi khi sửa tất cả nguồn tin: ", e);
            return ResponseEntity.ok(result);
        }
    }
    
    /**
     * Cập nhật selectors cho nguồn tin dựa trên cấu trúc trang hiện tại
     */
    private boolean updateSourceSelectors(NewsSource source) throws IOException {
        log.info("Đang cập nhật selectors cho nguồn: {}", source.getName());
        boolean updated = false;
        
        String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        
        // Tải trang nguồn
        Document doc = Jsoup.connect(source.getUrl())
                .userAgent(userAgent)
                .timeout(15000)
                .get();
        
        // Kiểm tra selector bài viết
        Elements articles = doc.select(source.getArticleSelector());
        if (articles.isEmpty()) {
            // Thử các selectors phổ biến
            String[] commonSelectors = {
                ".story-item", ".cate-list .st", "article", ".item", ".news-item",
                ".bm_F .bm_S", ".bm_B", ".story", ".item-news", ".list-content article",
                ".box-item-post", ".list-news article", ".box-news"
            };
            
            String bestSelector = null;
            int maxCount = 0;
            
            for (String selector : commonSelectors) {
                int count = doc.select(selector).size();
                if (count > maxCount) {
                    maxCount = count;
                    bestSelector = selector;
                }
            }
            
            if (bestSelector != null && maxCount > 0) {
                source.setArticleSelector(bestSelector);
                updated = true;
                log.info("Cập nhật selector bài viết cho {}: {}", source.getName(), bestSelector);
            }
        }
        
        // Lấy URL bài viết đầu tiên nếu có thể
        String articleUrl = null;
        Elements updatedArticles = doc.select(source.getArticleSelector());
        if (!updatedArticles.isEmpty()) {
            Element firstArticle = updatedArticles.first();
            Element link = firstArticle.select("a").first();
            if (link != null) {
                String href = link.attr("href");
                if (!href.startsWith("http")) {
                    if (href.startsWith("/")) {
                        java.net.URL url = new java.net.URL(source.getUrl());
                        String domain = url.getProtocol() + "://" + url.getHost();
                        href = domain + href;
                    } else {
                        href = source.getUrl() + "/" + href;
                    }
                }
                articleUrl = href;
            }
        }
        
        // Nếu có URL bài viết, kiểm tra selectors nội dung
        if (articleUrl != null) {
            Document articleDoc = Jsoup.connect(articleUrl)
                    .userAgent(userAgent)
                    .timeout(15000)
                    .get();
            
            // Kiểm tra selector tiêu đề
            String titleText = articleDoc.select(source.getTitleSelector()).text();
            if (titleText.isEmpty()) {
                String[] commonTitleSelectors = {
                    "h1.title", "h1.detail-title", "h1.article-title", ".title", 
                    ".detail-title", "h1", "article h1", ".headline", ".article-title"
                };
                
                for (String selector : commonTitleSelectors) {
                    titleText = articleDoc.select(selector).text();
                    if (!titleText.isEmpty()) {
                        source.setTitleSelector(selector);
                        updated = true;
                        log.info("Cập nhật selector tiêu đề cho {}: {}", source.getName(), selector);
                        break;
                    }
                }
            }
            
            // Kiểm tra selector nội dung
            String contentHtml = articleDoc.select(source.getContentSelector()).html();
            if (contentHtml.isEmpty()) {
                String[] commonContentSelectors = {
                    ".article-content", ".news-content", ".detail-content", 
                    ".article-body", ".news-detail", ".content-news", 
                    ".detail", ".content-detail", ".entry-content",
                    ".post-content", ".article", "article .content",
                    ".news-text", ".text-content", ".story-detail",
                    ".contentdetail"
                };
                
                for (String selector : commonContentSelectors) {
                    contentHtml = articleDoc.select(selector).html();
                    if (!contentHtml.isEmpty() && contentHtml.length() > 100) {
                        source.setContentSelector(selector);
                        updated = true;
                        log.info("Cập nhật selector nội dung cho {}: {}", source.getName(), selector);
                        break;
                    }
                }
            }
            
            // Kiểm tra selector tóm tắt
            String summaryText = source.getSummarySelector() != null ? 
                    articleDoc.select(source.getSummarySelector()).text() : "";
            if (summaryText.isEmpty()) {
                String[] commonSummarySelectors = {
                    "h2.sapo", ".detail-sapo", ".article-sapo", ".summary", 
                    ".sapo", ".description", ".lead", ".intro", ".snippet",
                    "h2.summary", ".article-summary", ".news-sapo"
                };
                
                for (String selector : commonSummarySelectors) {
                    summaryText = articleDoc.select(selector).text();
                    if (!summaryText.isEmpty()) {
                        source.setSummarySelector(selector);
                        updated = true;
                        log.info("Cập nhật selector tóm tắt cho {}: {}", source.getName(), selector);
                        break;
                    }
                }
            }
            
            // Kiểm tra selector hình ảnh
            String imageUrl = source.getImageSelector() != null ? 
                    articleDoc.select(source.getImageSelector()).attr("src") : "";
            if (imageUrl.isEmpty()) {
                String[] commonImageSelectors = {
                    ".detail-img img", ".article-img img", ".main-img img",
                    ".featured-image img", ".thumbnail img", ".image img",
                    "article img:first-of-type", ".content img:first-of-type",
                    ".article-content img:first-of-type"
                };
                
                for (String selector : commonImageSelectors) {
                    Element imgElement = articleDoc.select(selector).first();
                    if (imgElement != null) {
                        imageUrl = imgElement.hasAttr("data-src") ? 
                                imgElement.attr("data-src") : imgElement.attr("src");
                        if (!imageUrl.isEmpty()) {
                            source.setImageSelector(selector);
                            updated = true;
                            log.info("Cập nhật selector hình ảnh cho {}: {}", source.getName(), selector);
                            break;
                        }
                    }
                }
            }
        }
        
        // Lưu lại nếu có cập nhật
        if (updated) {
            newsSourceRepository.save(source);
            log.info("Đã cập nhật selectors cho nguồn: {}", source.getName());
        }
        
        return updated;
    }

    @GetMapping("/news-source/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> debugNewsSource(@PathVariable Long id) {
        try {
            Optional<NewsSource> optionalSource = newsSourceRepository.findById(id);
            if (optionalSource.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            NewsSource source = optionalSource.get();
            String url = source.getUrl();
            
            Map<String, Object> result = new HashMap<>();
            result.put("source", source);
            
            // Try to connect to the source URL
            String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
            
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent(userAgent)
                        .timeout(15000)
                        .get();
                
                result.put("connected", true);
                result.put("title", doc.title());
                
                // Test article selector
                Elements articleElements = doc.select(source.getArticleSelector());
                result.put("articlesFound", articleElements.size());
                
                List<Map<String, String>> articles = new ArrayList<>();
                int counter = 0;
                for (Element article : articleElements) {
                    if (counter >= 5) break; // Limit to 5 articles for brevity
                    
                    Map<String, String> articleInfo = new HashMap<>();
                    Element titleEl = article.selectFirst("a");
                    if (titleEl != null) {
                        articleInfo.put("title", titleEl.text());
                        String href = titleEl.attr("href");
                        if (!href.startsWith("http")) {
                            if (href.startsWith("/")) {
                                // Extract domain
                                java.net.URL urlObj = new java.net.URL(url);
                                String domain = urlObj.getProtocol() + "://" + urlObj.getHost();
                                href = domain + href;
                            } else {
                                href = url + "/" + href;
                            }
                        }
                        articleInfo.put("url", href);
                        
                        // Try to open the article
                        try {
                            Document articleDoc = Jsoup.connect(href)
                                    .userAgent(userAgent)
                                    .timeout(15000)
                                    .get();
                            
                            // Check title
                            Element articleTitleEl = articleDoc.selectFirst(source.getTitleSelector());
                            if (articleTitleEl != null) {
                                articleInfo.put("articleTitle", articleTitleEl.text());
                                articleInfo.put("titleSelectorWorks", "true");
                            } else {
                                articleInfo.put("titleSelectorWorks", "false");
                                articleInfo.put("titleSelectorError", "Không tìm thấy tiêu đề với bộ chọn: " + source.getTitleSelector());
                            }
                            
                            // Check summary
                            Element summaryEl = articleDoc.selectFirst(source.getSummarySelector());
                            if (summaryEl != null) {
                                articleInfo.put("summary", summaryEl.text());
                                articleInfo.put("summarySelectorWorks", "true");
                            } else {
                                articleInfo.put("summarySelectorWorks", "false");
                                articleInfo.put("summarySelectorError", "Không tìm thấy tóm tắt với bộ chọn: " + source.getSummarySelector());
                            }
                            
                            // Check content
                            Element contentEl = articleDoc.selectFirst(source.getContentSelector());
                            if (contentEl != null) {
                                // Just show first 200 chars of content
                                String content = contentEl.text();
                                articleInfo.put("content", content.length() > 200 ? content.substring(0, 200) + "..." : content);
                                articleInfo.put("contentLength", String.valueOf(content.length()));
                                articleInfo.put("contentSelectorWorks", "true");
                            } else {
                                articleInfo.put("contentSelectorWorks", "false");
                                articleInfo.put("contentSelectorError", "Không tìm thấy nội dung với bộ chọn: " + source.getContentSelector());
                            }
                            
                            // Check image
                            Elements imageEls = articleDoc.select(source.getImageSelector());
                            if (!imageEls.isEmpty()) {
                                articleInfo.put("imageUrl", imageEls.first().attr("src"));
                                articleInfo.put("imageSelectorWorks", "true");
                                articleInfo.put("imageCount", String.valueOf(imageEls.size()));
                            } else {
                                articleInfo.put("imageSelectorWorks", "false");
                                articleInfo.put("imageSelectorError", "Không tìm thấy hình ảnh với bộ chọn: " + source.getImageSelector());
                            }
                        } catch (Exception e) {
                            articleInfo.put("error", "Không thể tải trang bài viết: " + e.getMessage());
                        }
                    } else {
                        articleInfo.put("error", "Không tìm thấy liên kết trong phần tử bài viết");
                    }
                    
                    articles.add(articleInfo);
                    counter++;
                }
                
                result.put("articleSamples", articles);
                
                // Đề xuất các bộ chọn thay thế
                Map<String, String> alternativeSelectors = findAlternativeSelectors(doc);
                result.put("suggestedSelectors", alternativeSelectors);
                
            } catch (IOException e) {
                result.put("connected", false);
                result.put("error", "Không thể kết nối đến URL: " + e.getMessage());
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi khi debug nguồn tin: " + e.getMessage())
            );
        }
    }
    
    private Map<String, String> findAlternativeSelectors(Document doc) {
        Map<String, String> selectors = new HashMap<>();
        
        // Find article selectors
        String[] articleSelectors = {
            "article", ".article", ".story-item", ".news-item", ".item", 
            ".cate-list .st", ".item-news", ".list-news article", ".list-news .item", 
            ".news-card", ".card", ".story", ".entry", ".vnn-card", ".post",
            ".featured-news article", ".item-post", "li.item"
        };
        
        Map<String, Integer> articleSelectorCounts = new HashMap<>();
        for (String selector : articleSelectors) {
            int count = doc.select(selector).size();
            if (count > 0) {
                articleSelectorCounts.put(selector, count);
            }
        }
        
        // Sort by count descending
        List<Map.Entry<String, Integer>> sortedArticleSelectors = new ArrayList<>(articleSelectorCounts.entrySet());
        sortedArticleSelectors.sort(Map.Entry.<String, Integer>comparingByValue().reversed());
        
        if (!sortedArticleSelectors.isEmpty()) {
            selectors.put("articleSelector", sortedArticleSelectors.get(0).getKey());
        }
        
        return selectors;
    }
    
    @PostMapping("/fix-news-source/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> fixNewsSource(@PathVariable Long id) {
        try {
            Optional<NewsSource> optionalSource = newsSourceRepository.findById(id);
            if (optionalSource.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            NewsSource source = optionalSource.get();
            String url = source.getUrl();
            
            boolean updated = false;
            StringBuilder updateLog = new StringBuilder("Cập nhật nguồn tin " + source.getName() + ":\n");
            
            // Try to connect to the source URL
            String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
            
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent(userAgent)
                        .timeout(15000)
                        .get();
                
                // Test and fix article selector
                Elements articleElements = doc.select(source.getArticleSelector());
                if (articleElements.isEmpty()) {
                    // Try alternative selectors
                    String originalSelector = source.getArticleSelector();
                    Map<String, String> alternatives = findAlternativeSelectors(doc);
                    
                    if (alternatives.containsKey("articleSelector")) {
                        source.setArticleSelector(alternatives.get("articleSelector"));
                        updateLog.append("- Đã cập nhật articleSelector từ '")
                                 .append(originalSelector)
                                 .append("' thành '")
                                 .append(alternatives.get("articleSelector"))
                                 .append("'\n");
                        updated = true;
                    }
                }
                
                // Get a test article URL
                Element firstArticle = null;
                String articleUrl = null;
                
                articleElements = doc.select(source.getArticleSelector());
                if (!articleElements.isEmpty()) {
                    firstArticle = articleElements.first();
                    Element linkEl = firstArticle.selectFirst("a");
                    if (linkEl != null) {
                        String href = linkEl.attr("href");
                        if (!href.startsWith("http")) {
                            if (href.startsWith("/")) {
                                // Extract domain
                                java.net.URL urlObj = new java.net.URL(url);
                                String domain = urlObj.getProtocol() + "://" + urlObj.getHost();
                                href = domain + href;
                            } else {
                                href = url + "/" + href;
                            }
                        }
                        articleUrl = href;
                    }
                }
                
                if (articleUrl != null) {
                    try {
                        Document articleDoc = Jsoup.connect(articleUrl)
                                .userAgent(userAgent)
                                .timeout(15000)
                                .get();
                        
                        // Fix title selector
                        Element titleEl = articleDoc.selectFirst(source.getTitleSelector());
                        if (titleEl == null) {
                            String originalSelector = source.getTitleSelector();
                            String[] commonTitleSelectors = {
                                "h1.title", "h1.detail-title", "h1.article-title", 
                                "h1.content-detail-title", ".title-detail", ".article-title", 
                                ".post-title", "h1.title-news", "h1"
                            };
                            
                            for (String selector : commonTitleSelectors) {
                                Element found = articleDoc.selectFirst(selector);
                                if (found != null) {
                                    source.setTitleSelector(selector);
                                    updateLog.append("- Đã cập nhật titleSelector từ '")
                                             .append(originalSelector)
                                             .append("' thành '")
                                             .append(selector)
                                             .append("'\n");
                                    updated = true;
                                    break;
                                }
                            }
                        }
                        
                        // Fix summary selector
                        Element summaryEl = articleDoc.selectFirst(source.getSummarySelector());
                        if (summaryEl == null) {
                            String originalSelector = source.getSummarySelector();
                            String[] commonSummarySelectors = {
                                "h2.sapo", ".detail-sapo", ".article-sapo", ".sapo", 
                                ".summary", ".article-summary", ".post-excerpt", 
                                ".content-detail-sapo", ".description-detail"
                            };
                            
                            for (String selector : commonSummarySelectors) {
                                Element found = articleDoc.selectFirst(selector);
                                if (found != null) {
                                    source.setSummarySelector(selector);
                                    updateLog.append("- Đã cập nhật summarySelector từ '")
                                             .append(originalSelector)
                                             .append("' thành '")
                                             .append(selector)
                                             .append("'\n");
                                    updated = true;
                                    break;
                                }
                            }
                        }
                        
                        // Fix content selector
                        Element contentEl = articleDoc.selectFirst(source.getContentSelector());
                        if (contentEl == null) {
                            String originalSelector = source.getContentSelector();
                            String[] commonContentSelectors = {
                                ".detail-content", ".article-content", ".content-detail", 
                                ".article-body", ".entry-content", ".post-content", 
                                ".content-detail-body", ".news-content", ".content"
                            };
                            
                            for (String selector : commonContentSelectors) {
                                Element found = articleDoc.selectFirst(selector);
                                if (found != null && found.text().length() > 200) {
                                    source.setContentSelector(selector);
                                    updateLog.append("- Đã cập nhật contentSelector từ '")
                                             .append(originalSelector)
                                             .append("' thành '")
                                             .append(selector)
                                             .append("'\n");
                                    updated = true;
                                    break;
                                }
                            }
                        }
                        
                        // Fix image selector
                        Elements imageEls = articleDoc.select(source.getImageSelector());
                        if (imageEls.isEmpty()) {
                            String originalSelector = source.getImageSelector();
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
                                    updateLog.append("- Đã cập nhật imageSelector từ '")
                                             .append(originalSelector)
                                             .append("' thành '")
                                             .append(selector)
                                             .append("'\n");
                                    updated = true;
                                    break;
                                }
                            }
                        }
                    } catch (Exception e) {
                        updateLog.append("- Lỗi khi kiểm tra trang bài viết: ").append(e.getMessage()).append("\n");
                    }
                } else {
                    updateLog.append("- Không tìm thấy URL bài viết để kiểm tra\n");
                }
                
            } catch (IOException e) {
                updateLog.append("- Lỗi kết nối: ").append(e.getMessage()).append("\n");
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Không thể kết nối đến URL nguồn tin",
                    "log", updateLog.toString(),
                    "error", e.getMessage()
                ));
            }
            
            if (updated) {
                // Lưu các thay đổi
                newsSourceRepository.save(source);
                updateLog.append("- Đã lưu các thay đổi vào cơ sở dữ liệu\n");
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã cập nhật nguồn tin thành công",
                    "source", source,
                    "log", updateLog.toString()
                ));
            } else {
                updateLog.append("- Không có thay đổi nào được thực hiện\n");
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Không tìm thấy bộ chọn thay thế phù hợp",
                    "source", source,
                    "log", updateLog.toString()
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Lỗi khi sửa nguồn tin: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/check-source-urls")
    public ResponseEntity<?> checkSourceUrls() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> sources = new ArrayList<>();
        
        List<NewsSource> allSources = newsSourceRepository.findAll();
        result.put("totalSources", allSources.size());
        
        String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        
        for (NewsSource source : allSources) {
            Map<String, Object> sourceInfo = new HashMap<>();
            sourceInfo.put("id", source.getId());
            sourceInfo.put("name", source.getName());
            sourceInfo.put("url", source.getUrl());
            
            try {
                // Kiểm tra URL của nguồn
                log.info("Checking URL for source: {}", source.getName());
                Document doc = Jsoup.connect(source.getUrl())
                        .userAgent(userAgent)
                        .timeout(10000)
                        .get();
                
                sourceInfo.put("status", "OK");
                sourceInfo.put("title", doc.title());
                
                // Đếm số lượng bài viết tìm thấy
                Elements articles = doc.select(source.getArticleSelector());
                sourceInfo.put("articlesFound", articles.size());
                
                if (articles.isEmpty()) {
                    // Hiển thị các bộ chọn thay thế
                    Map<String, Integer> alternativeSelectors = new HashMap<>();
                    
                    String[] commonSelectors = {
                        "article", ".article", ".story-item", ".news-item", ".item", 
                        ".cate-list .st", ".item-news", ".list-news article", ".list-news .item", 
                        ".news-card", ".card", ".story", ".entry", ".vnn-card", ".post",
                        "div[class*=article]", "div[class*=news-item]", "div[class*=story]"
                    };
                    
                    for (String selector : commonSelectors) {
                        int count = doc.select(selector).size();
                        if (count > 0) {
                            alternativeSelectors.put(selector, count);
                        }
                    }
                    
                    sourceInfo.put("alternativeSelectors", alternativeSelectors);
                    
                    // Đề xuất selector tốt nhất
                    if (!alternativeSelectors.isEmpty()) {
                        String bestSelector = Collections.max(
                            alternativeSelectors.entrySet(), 
                            Map.Entry.comparingByValue()
                        ).getKey();
                        
                        sourceInfo.put("suggestedSelector", bestSelector);
                        sourceInfo.put("suggestedCount", alternativeSelectors.get(bestSelector));
                    }
                }
            } catch (Exception e) {
                sourceInfo.put("status", "ERROR");
                sourceInfo.put("error", e.getMessage());
            }
            
            sources.add(sourceInfo);
        }
        
        result.put("sources", sources);
        return ResponseEntity.ok(result);
    }
} 