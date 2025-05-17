package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.NewsDTO;
import com.agricultural.agricultural.entity.News;
import com.agricultural.agricultural.entity.NewsSource;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.NewsMapper;
import com.agricultural.agricultural.repository.NewsRepository;
import com.agricultural.agricultural.repository.NewsSourceRepository;
import com.agricultural.agricultural.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final NewsSourceRepository newsSourceRepository;
    private final NewsMapper newsMapper;

    @Override
    public Page<NewsDTO> getAllNews(Pageable pageable) {
        Page<News> newsPage = newsRepository.findAllByActiveTrue(pageable);
        log.info("getAllNews: Tìm thấy {} bản ghi", newsPage.getTotalElements());
        
        List<NewsDTO> newsDTOs = newsMapper.toDTOList(newsPage.getContent());
        
        // Nếu không có dữ liệu, thực hiện fetch tin tức mới
        if (newsDTOs.isEmpty()) {
            log.warn("getAllNews: Không có dữ liệu từ database, đang thu thập tin tức mới từ nguồn...");
            try {
                fetchNewsFromSources();
                // Thử lấy lại dữ liệu sau khi fetch
                newsPage = newsRepository.findAllByActiveTrue(pageable);
                newsDTOs = newsMapper.toDTOList(newsPage.getContent());
            } catch (Exception e) {
                log.error("Lỗi khi thu thập tin tức: {}", e.getMessage());
                // Return empty page instead of sample data
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }
        }
        
        return new PageImpl<>(
                newsDTOs,
                pageable,
                newsPage.getTotalElements()
        );
    }

    @Override
    public Page<NewsDTO> getNewsByCategory(String category, Pageable pageable) {
        Page<News> newsPage = newsRepository.findAllByActiveTrueAndCategoryIgnoreCase(category, pageable);
        log.info("getNewsByCategory: Category={}, Tìm thấy {} bản ghi", category, newsPage.getTotalElements());
        
        List<NewsDTO> newsDTOs = newsMapper.toDTOList(newsPage.getContent());
        
        // Nếu không có dữ liệu, thử thu thập tin tức mới
        if (newsDTOs.isEmpty()) {
            log.warn("getNewsByCategory: Không có dữ liệu từ database cho category {}, đang thu thập tin tức mới...", category);
            try {
                // Tìm các nguồn tin tức phù hợp với category này
                List<NewsSource> newsSources = newsSourceRepository.findAllByActiveTrueAndCategoryIgnoreCase(category);
                if (!newsSources.isEmpty()) {
                    for (NewsSource source : newsSources) {
                        try {
                            fetchNewsFromSourceInternal(source);
                        } catch (Exception e) {
                            log.error("Lỗi khi thu thập tin từ nguồn {}: {}", source.getName(), e.getMessage());
                        }
                    }
                    
                    // Thử lấy lại dữ liệu sau khi fetch
                    newsPage = newsRepository.findAllByActiveTrueAndCategoryIgnoreCase(category, pageable);
                    newsDTOs = newsMapper.toDTOList(newsPage.getContent());
                }
            } catch (Exception e) {
                log.error("Lỗi khi thu thập tin tức cho category {}: {}", category, e.getMessage());
            }
        }
        
        return new PageImpl<>(
                newsDTOs,
                pageable,
                newsPage.getTotalElements()
        );
    }

    @Override
    public NewsDTO getNewsById(Long id) {
        try {
            News news = newsRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("News not found with id: " + id));
            log.info("getNewsById: Tìm thấy tin tức có id={}", id);
            return newsMapper.toDTO(news);
        } catch (ResourceNotFoundException e) {
            log.warn("getNewsById: Không tìm thấy tin tức có id={}. Không trả về dữ liệu mẫu.", id);
            throw e;
        }
    }

    @Override
    public List<NewsDTO> getLatestNews() {
        List<News> latestNews = newsRepository.findTop10ByActiveTrueOrderByPublishedDateDesc();
        log.info("getLatestNews: Tìm thấy {} bản ghi mới nhất", latestNews.size());
        
        List<NewsDTO> latestNewsDTOs = newsMapper.toDTOList(latestNews);
        
        // Nếu không có dữ liệu, thử thu thập tin tức mới
        if (latestNewsDTOs.isEmpty()) {
            log.warn("getLatestNews: Không có dữ liệu từ database, đang thu thập tin tức mới...");
            try {
                fetchNewsFromSources();
                // Thử lấy lại dữ liệu sau khi fetch
                latestNews = newsRepository.findTop10ByActiveTrueOrderByPublishedDateDesc();
                latestNewsDTOs = newsMapper.toDTOList(latestNews);
            } catch (Exception e) {
                log.error("Lỗi khi thu thập tin tức mới: {}", e.getMessage());
                // Return empty list instead of sample data
                return new ArrayList<>();
            }
        }
        
        return latestNewsDTOs;
    }

    @Override
    public Page<NewsDTO> searchNews(String keyword, Pageable pageable) {
        Page<News> newsPage = newsRepository.findByTitleContainingIgnoreCaseAndActiveTrue(keyword, pageable);
        log.info("searchNews: Keyword={}, Tìm thấy {} bản ghi", keyword, newsPage.getTotalElements());
        
        List<NewsDTO> newsDTOs = newsMapper.toDTOList(newsPage.getContent());
        
        // Nếu không có dữ liệu, thử thu thập tin tức mới
        if (newsDTOs.isEmpty()) {
            log.warn("searchNews: Không có dữ liệu từ database cho keyword {}, đang thu thập tin tức mới...", keyword);
            try {
                fetchNewsFromSources();
                // Thử tìm kiếm lại sau khi thu thập
                newsPage = newsRepository.findByTitleContainingIgnoreCaseAndActiveTrue(keyword, pageable);
                newsDTOs = newsMapper.toDTOList(newsPage.getContent());
            } catch (Exception e) {
                log.error("Lỗi khi thu thập tin tức mới: {}", e.getMessage());
            }
        }
        
        return new PageImpl<>(
                newsDTOs,
                pageable,
                newsPage.getTotalElements()
        );
    }

    @Override
    @Transactional
    public NewsDTO createNews(NewsDTO newsDTO) {
        News news = newsMapper.toEntity(newsDTO);
        news.setUniqueId(UUID.randomUUID().toString());
        news.setActive(true);
        News savedNews = newsRepository.save(news);
        return newsMapper.toDTO(savedNews);
    }

    @Override
    @Transactional
    public NewsDTO updateNews(Long id, NewsDTO newsDTO) {
        News existingNews = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with id: " + id));

        existingNews.setTitle(newsDTO.getTitle());
        existingNews.setSummary(newsDTO.getSummary());
        existingNews.setContent(newsDTO.getContent());
        existingNews.setImageUrl(newsDTO.getImageUrl());
        existingNews.setSourceUrl(newsDTO.getSourceUrl());
        existingNews.setSourceName(newsDTO.getSourceName());
        existingNews.setCategory(newsDTO.getCategory());
        existingNews.setTags(newsDTO.getTags());
        
        if (newsDTO.getPublishedDate() != null) {
            existingNews.setPublishedDate(newsDTO.getPublishedDate());
        }

        News updatedNews = newsRepository.save(existingNews);
        return newsMapper.toDTO(updatedNews);
    }

    @Override
    @Transactional
    public void deleteNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with id: " + id));
        news.setActive(false);
        newsRepository.save(news);
    }

    @Override
    @Transactional
    public void fetchNewsFromSources() {
        List<NewsSource> activeSources = newsSourceRepository.findAllByActiveTrue();
        for (NewsSource source : activeSources) {
            try {
                fetchNewsFromSourceInternal(source);
            } catch (Exception e) {
                log.error("Error fetching news from source: {}", source.getName(), e);
            }
        }
        
        // Fix any problematic image URLs in existing articles
        fixProblematicImageUrls();
    }

    @Override
    @Transactional
    public void fetchNewsFromSource(Long sourceId) {
        NewsSource source = newsSourceRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("News source not found with id: " + sourceId));
        
        if (!source.getActive()) {
            log.warn("Attempted to fetch news from inactive source: {}", source.getName());
            return;
        }
        
        try {
            fetchNewsFromSourceInternal(source);
        } catch (Exception e) {
            log.error("Error fetching news from source: {}", source.getName(), e);
            throw new RuntimeException("Failed to fetch news from source: " + source.getName(), e);
        }
    }

    private void fetchNewsFromSourceInternal(NewsSource source) {
        try {
            log.info("Fetching news from source: {}", source.getName());
            
            // Add a user agent to avoid blocking
            String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
            
            // Try to fetch more pages to get more articles
            int maxPages = 3; // Try to fetch 3 pages maximum
            int articlesFound = 0;
            int articlesSaved = 0;
            
            // Thêm tin tức mẫu nếu không tìm thấy bài viết nào
            boolean addSampleDataIfEmpty = true;
            
            for (int page = 1; page <= maxPages; page++) {
                String pageUrl = source.getUrl();
                // Add page parameter if needed (customize based on the source website's pagination pattern)
                if (page > 1) {
                    if (pageUrl.contains("?")) {
                        pageUrl += "&page=" + page;
                    } else {
                        pageUrl += "?page=" + page;
                    }
                }
                
                log.info("Fetching page {} from source: {}", page, pageUrl);
                
                Document doc = Jsoup.connect(pageUrl)
                        .userAgent(userAgent)
                        .timeout(15000) // Increase timeout to 15 seconds
                        .get();

                // Use the configured selector first
                Elements articleElements = doc.select(source.getArticleSelector());
                
                // If no elements found, try alternative selectors based on the website domain
                if (articleElements.isEmpty()) {
                    log.info("No articles found with configured selector: {}. Trying alternative selectors...", source.getArticleSelector());
                    
                    if (pageUrl.contains("nongnghiep.vn")) {
                        // Try alternative selectors for nongnghiep.vn
                        articleElements = doc.select(".list-news .story, .featured-news article, .item-news, .cate-content article");
                    } else if (pageUrl.contains("danviet.vn")) {
                        // Try alternative selectors for danviet.vn
                        articleElements = doc.select(".list-news article, .item-news, .list-news .news-item, .list-news-home .item");
                    } else if (pageUrl.contains("baomoi.com")) {
                        // Try alternative selectors for baomoi.com
                        articleElements = doc.select(".bm_c .bm_S, .story, .article-item");
                    } else if (pageUrl.contains("vietnamnet.vn")) {
                        // Try alternative selectors for vietnamnet.vn
                        articleElements = doc.select(".item-news, .list-content article, .box-item-post, .item");
                    }
                    
                    log.info("Found {} article elements using alternative selectors", articleElements.size());
                }
                
                log.info("Found {} article elements on page {}", articleElements.size(), page);
                articlesFound += articleElements.size();
                
                if (articleElements.isEmpty() && page > 1) {
                    log.info("No more articles found on page {}, stopping pagination", page);
                    break;
                }

                for (Element articleElement : articleElements) {
                    try {
                        String articleUrl = getArticleUrl(articleElement, pageUrl);
                        if (articleUrl == null || articleUrl.isEmpty()) {
                            log.debug("Could not extract article URL, skipping");
                            continue;
                        }

                        log.debug("Processing article: {}", articleUrl);
                        
                        // Kiểm tra xem bài viết đã tồn tại chưa
                        String uniqueId = generateUniqueId(articleUrl);
                        if (newsRepository.existsByUniqueId(uniqueId)) {
                            log.debug("Article already exists: {}", articleUrl);
                            continue;
                        }

                        // Tải nội dung bài viết với retry mechanism
                        Document articleDoc = null;
                        int maxRetries = 3;
                        for (int retry = 0; retry < maxRetries; retry++) {
                            try {
                                articleDoc = Jsoup.connect(articleUrl)
                                        .userAgent(userAgent)
                                        .timeout(15000) // Increase timeout
                                        .get();
                                break;
                            } catch (IOException e) {
                                if (retry == maxRetries - 1) {
                                    throw e;
                                }
                                log.warn("Failed to fetch article, retrying ({}/{}): {}", retry + 1, maxRetries, articleUrl);
                                Thread.sleep(1000); // Wait 1 second before retry
                            }
                        }
                        
                        if (articleDoc == null) {
                            log.warn("Could not load article after retries: {}", articleUrl);
                            continue;
                        }

                        // Trích xuất thông tin bài viết - try fallback selectors if main ones fail
                        String title = extractTextWithFallback(articleDoc, source.getTitleSelector(), "h1.title, h1.detail-title, h1.article-title, .title, .detail-title");
                        String summary = source.getSummarySelector() != null ? 
                                extractTextWithFallback(articleDoc, source.getSummarySelector(), "h2.sapo, .detail-sapo, .article-sapo, .summary, .sapo") : "";
                        String content = source.getContentSelector() != null ? 
                                extractHtmlWithFallback(articleDoc, source.getContentSelector(), "div.detail-content, .article-body, .content-detail, .article-content") : "";
                        String imageUrl = source.getImageSelector() != null ? 
                                extractImageUrlWithFallback(articleDoc, source.getImageSelector(), "div.detail-content img, .article-body img, .content-news img", source.getUrl()) : "";
                        LocalDateTime publishedDate = extractDate(articleDoc, source, LocalDateTime.now());

                        if (title.isEmpty() || content.isEmpty()) {
                            log.debug("Skipping article with missing title or content: {}", articleUrl);
                            continue;
                        }

                        // Lưu bài viết
                        News news = News.builder()
                                .title(title)
                                .summary(summary)
                                .content(content)
                                .imageUrl(imageUrl)
                                .sourceUrl(articleUrl)
                                .sourceName(source.getName())
                                .publishedDate(publishedDate)
                                .category(source.getCategory())
                                .uniqueId(uniqueId)
                                .active(true)
                                .build();

                        newsRepository.save(news);
                        articlesSaved++;
                        log.info("Saved article: {} from {}", title, source.getName());

                    } catch (Exception e) {
                        log.error("Error processing article from {}: {}", source.getName(), e.getMessage());
                        // Continue with next article
                    }
                }
                
                // If we didn't save any articles from this page and it's not the first page, stop pagination
                if (articlesSaved == 0 && page > 1) {
                    log.info("No new articles saved from page {}, stopping pagination", page);
                    break;
                }
                
                // Small delay between page fetches to avoid overloading the target server
                if (page < maxPages) {
                    Thread.sleep(2000);
                }
            }
            
            log.info("Completed fetching from {}: found {} articles, saved {} new articles", 
                    source.getName(), articlesFound, articlesSaved);
            
            // Nếu không tìm thấy bài viết nào, thêm dữ liệu mẫu
            if (articlesFound == 0 && addSampleDataIfEmpty) {
                addSampleNewsForSource(source);
            }
            
        } catch (IOException e) {
            log.error("Error connecting to source URL: {}", source.getUrl(), e);
            
            // Nếu có lỗi kết nối, thêm dữ liệu mẫu
            addSampleNewsForSource(source);
            
            throw new RuntimeException("Failed to connect to news source: " + source.getName(), e);
        } catch (Exception e) {
            log.error("Unexpected error fetching news from {}: {}", source.getName(), e.getMessage(), e);
            
            // Nếu có lỗi khác, thêm dữ liệu mẫu
            addSampleNewsForSource(source);
            
            throw new RuntimeException("Failed to fetch news from source: " + source.getName(), e);
        }
    }

    private void addSampleNewsForSource(NewsSource source) {
        log.info("Không tìm thấy bài viết từ nguồn {}, thêm dữ liệu mẫu...", source.getName());
        
        try {
            // Tạo 5 bài viết mẫu
            for (int i = 1; i <= 5; i++) {
                String title = "Tin tức nông nghiệp #" + i + " từ " + source.getName();
                String content = "<p>Đây là nội dung tin tức nông nghiệp mẫu #" + i + " từ " + source.getName() + ".</p>" +
                        "<p>Nội dung này được tạo tự động khi không thể crawl được dữ liệu từ nguồn tin.</p>" +
                        "<p>Hệ thống sẽ cố gắng crawl lại dữ liệu thực vào lần sau.</p>";
                String summary = "Tóm tắt tin tức nông nghiệp mẫu #" + i + " từ " + source.getName();
                
                // Sử dụng phương thức getRandomReliableImageUrl để lấy hình ảnh tin cậy
                String imageUrl = getRandomReliableImageUrl();
                
                String uniqueId = "sample-" + source.getId() + "-" + i + "-" + UUID.randomUUID().toString();
                
                // Tạo bài viết
                News news = News.builder()
                        .title(title)
                        .summary(summary)
                        .content(content)
                        .imageUrl(imageUrl)
                        .sourceUrl("#")
                        .sourceName(source.getName())
                        .publishedDate(LocalDateTime.now().minusDays(i))
                        .category(source.getCategory())
                        .uniqueId(uniqueId)
                        .active(true)
                        .build();
                
                // Lưu vào database
                newsRepository.save(news);
                log.info("Đã thêm bài viết mẫu #{} cho nguồn {}", i, source.getName());
            }
        } catch (Exception e) {
            log.error("Lỗi khi thêm dữ liệu mẫu cho nguồn {}: {}", source.getName(), e.getMessage());
        }
    }

    private String getArticleUrl(Element articleElement, String baseUrl) {
        Element linkElement = articleElement.select("a").first();
        if (linkElement == null) {
            return null;
        }

        String href = linkElement.attr("href");
        if (href.isEmpty()) {
            return null;
        }

        // Kiểm tra xem URL đã đầy đủ chưa
        if (href.startsWith("http")) {
            return href;
        } else {
            // Xử lý URL tương đối
            if (href.startsWith("/")) {
                // Lấy phần domain từ baseUrl
                String domain;
                try {
                    java.net.URL url = new java.net.URL(baseUrl);
                    domain = url.getProtocol() + "://" + url.getHost();
                    return domain + href;
                } catch (Exception e) {
                    log.error("Error parsing base URL", e);
                    return baseUrl + href;
                }
            } else {
                return baseUrl + "/" + href;
            }
        }
    }

    private String extractText(Document doc, String selector) {
        try {
            Element element = doc.selectFirst(selector);
            return element != null ? element.text().trim() : "";
        } catch (Exception e) {
            log.error("Error extracting text with selector: {}", selector, e);
            return "";
        }
    }

    private String extractHtml(Document doc, String selector) {
        try {
            Element element = doc.selectFirst(selector);
            return element != null ? element.html().trim() : "";
        } catch (Exception e) {
            log.error("Error extracting HTML with selector: {}", selector, e);
            return "";
        }
    }

    private String extractImageUrl(Document doc, String selector, String baseUrl) {
        try {
            Element imgElement = doc.selectFirst(selector);
            if (imgElement == null) {
                return getRandomReliableImageUrl();
            }

            String src = imgElement.hasAttr("data-src") ? imgElement.attr("data-src") : imgElement.attr("src");
            if (src.isEmpty()) {
                return getRandomReliableImageUrl();
            }

            // Check if the image URL is from a problematic domain
            if (src.contains("istockphoto.com") || src.contains("shutterstock.com") || 
                src.contains("gettyimages.com") || src.contains("alamy.com")) {
                log.info("Detected stock photo URL that may be restricted: {}", src);
                return getRandomReliableImageUrl();
            }

            // Kiểm tra xem URL đã đầy đủ chưa
            if (src.startsWith("http")) {
                return src;
            } else {
                // Xử lý URL tương đối
                if (src.startsWith("/")) {
                    // Lấy phần domain từ baseUrl
                    try {
                        java.net.URL url = new java.net.URL(baseUrl);
                        String domain = url.getProtocol() + "://" + url.getHost();
                        return domain + src;
                    } catch (Exception e) {
                        log.error("Error parsing base URL for image", e);
                        return getRandomReliableImageUrl();
                    }
                } else {
                    return baseUrl + "/" + src;
                }
            }
        } catch (Exception e) {
            log.error("Error extracting image URL with selector: {}", selector, e);
            return getRandomReliableImageUrl();
        }
    }

    private String getRandomReliableImageUrl() {
        // Mảng URL hình ảnh nông nghiệp đơn giản và ngắn gọn từ Freepik
        String[] reliableImageUrls = {
            "https://img.freepik.com/free-photo/farmer-working-rice-field_1150-7656.jpg",
            "https://img.freepik.com/free-photo/vegetables-harvest-farm_342744-1255.jpg",
            "https://img.freepik.com/free-photo/corn-field_1136-246.jpg",
            "https://img.freepik.com/free-photo/rice-paddy-field_1150-17925.jpg", 
            "https://img.freepik.com/free-photo/vietnamese-farmer-rice-paddy-field_1150-12537.jpg"
        };
        
        // Chọn ngẫu nhiên một URL
        int randomIndex = (int) (Math.random() * reliableImageUrls.length);
        return reliableImageUrls[randomIndex];
    }

    private LocalDateTime extractDate(Document doc, NewsSource source, LocalDateTime defaultDate) {
        if (source.getDateSelector() == null || source.getDateSelector().isEmpty()) {
            return defaultDate;
        }

        try {
            Element dateElement = doc.selectFirst(source.getDateSelector());
            if (dateElement == null) {
                return defaultDate;
            }

            String dateText = dateElement.text().trim();
            if (dateText.isEmpty()) {
                return defaultDate;
            }

            // Sử dụng định dạng từ cấu hình nguồn tin
            if (source.getDateFormat() != null && !source.getDateFormat().isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(source.getDateFormat());
                    return LocalDateTime.parse(dateText, formatter);
                } catch (DateTimeParseException e) {
                    log.error("Error parsing date with format: {}, date text: {}", source.getDateFormat(), dateText, e);
                    return defaultDate;
                }
            }

            // Thử một số định dạng phổ biến
            String[] commonFormats = {
                    "yyyy-MM-dd HH:mm:ss",
                    "dd/MM/yyyy HH:mm:ss",
                    "MM/dd/yyyy HH:mm:ss",
                    "yyyy-MM-dd'T'HH:mm:ss",
                    "dd/MM/yyyy",
                    "MM/dd/yyyy",
                    "yyyy-MM-dd"
            };

            for (String format : commonFormats) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
                    return LocalDateTime.parse(dateText, formatter);
                } catch (DateTimeParseException e) {
                    // Tiếp tục với định dạng tiếp theo
                }
            }

            return defaultDate;
        } catch (Exception e) {
            log.error("Error extracting date with selector: {}", source.getDateSelector(), e);
            return defaultDate;
        }
    }

    private String generateUniqueId(String url) {
        return UUID.nameUUIDFromBytes(url.getBytes()).toString();
    }

    @Override
    public long getNewsCount() {
        return newsRepository.count();
    }

    @Override
    @Transactional
    public int deleteAllNews() {
        log.info("Deleting all news articles from database");
        // Đếm số lượng bài viết trước khi xóa
        long countBefore = newsRepository.count();
        
        // Thực hiện xóa (sử dụng soft delete bằng cách đặt active=false)
        newsRepository.deactivateAllNews();
        
        // Hoặc xóa hoàn toàn khỏi database (uncomment dòng dưới nếu muốn xóa vĩnh viễn)
        // newsRepository.deleteAll();
        
        // Đếm sau khi xóa để tính số bài viết đã xóa
        long countAfter = newsRepository.count();
        long deleted = countBefore - countAfter;
        
        log.info("Deleted {} news articles", deleted);
        return (int) deleted;
    }

    private String extractTextWithFallback(Document doc, String selector, String fallbackSelectors) {
        String text = extractText(doc, selector);
        if (text.isEmpty() && fallbackSelectors != null && !fallbackSelectors.isEmpty()) {
            log.debug("Primary selector failed, trying fallback selectors: {}", fallbackSelectors);
            // Try each fallback selector
            for (String fallbackSelector : fallbackSelectors.split(",")) {
                text = extractText(doc, fallbackSelector.trim());
                if (!text.isEmpty()) {
                    log.debug("Found text using fallback selector: {}", fallbackSelector.trim());
                    break;
                }
            }
        }
        return text;
    }

    private String extractHtmlWithFallback(Document doc, String selector, String fallbackSelectors) {
        String html = extractHtml(doc, selector);
        if (html.isEmpty() && fallbackSelectors != null && !fallbackSelectors.isEmpty()) {
            log.debug("Primary selector failed, trying fallback selectors: {}", fallbackSelectors);
            // Try each fallback selector
            for (String fallbackSelector : fallbackSelectors.split(",")) {
                html = extractHtml(doc, fallbackSelector.trim());
                if (!html.isEmpty()) {
                    log.debug("Found HTML using fallback selector: {}", fallbackSelector.trim());
                    break;
                }
            }
        }
        return html;
    }

    private String extractImageUrlWithFallback(Document doc, String selector, String fallbackSelectors, String baseUrl) {
        String imageUrl = extractImageUrl(doc, selector, baseUrl);
        if (imageUrl.isEmpty() && fallbackSelectors != null && !fallbackSelectors.isEmpty()) {
            log.debug("Primary selector failed, trying fallback selectors: {}", fallbackSelectors);
            // Try each fallback selector
            for (String fallbackSelector : fallbackSelectors.split(",")) {
                imageUrl = extractImageUrl(doc, fallbackSelector.trim(), baseUrl);
                if (!imageUrl.isEmpty()) {
                    log.debug("Found image URL using fallback selector: {}", fallbackSelector.trim());
                    break;
                }
            }
        }
        return imageUrl;
    }

    /**
     * Finds and updates news articles with problematic image URLs
     */
    @Override
    public void fixProblematicImageUrls() {
        log.info("Checking for news articles with problematic image URLs...");
        
        try {
            // Get all active news articles - using findAll() and filtering
            List<News> allNews = newsRepository.findAll().stream()
                    .filter(News::getActive)
                    .collect(Collectors.toList());
            int fixedCount = 0;
            
            for (News news : allNews) {
                String imageUrl = news.getImageUrl();
                boolean needsFix = false;
                
                // Check if URL is empty or from a problematic domain
                if (imageUrl == null || imageUrl.isEmpty()) {
                    needsFix = true;
                } else if (imageUrl.contains("istockphoto.com") || 
                         imageUrl.contains("shutterstock.com") || 
                         imageUrl.contains("gettyimages.com") ||
                         imageUrl.contains("alamy.com")) {
                    needsFix = true;
                    log.info("Found news with problematic image URL: {} - {}", news.getId(), imageUrl);
                }
                
                // Replace problematic URLs with reliable ones
                if (needsFix) {
                    news.setImageUrl(getRandomReliableImageUrl());
                    newsRepository.save(news);
                    fixedCount++;
                }
            }
            
            if (fixedCount > 0) {
                log.info("Fixed {} news articles with problematic image URLs", fixedCount);
            } else {
                log.info("No problematic image URLs found");
            }
        } catch (Exception e) {
            log.error("Error fixing problematic image URLs: {}", e.getMessage());
        }
    }
} 