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
import java.util.Optional;
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
            
            // Thêm tin tức mẫu nếu không tìm thấy bài viết nào - mặc định là false để giảm việc tạo dữ liệu mẫu
            boolean addSampleDataIfEmpty = false;
            
            for (int page = 1; page <= maxPages; page++) {
                String pageUrl = source.getUrl();
                // Add page parameter if needed (customize based on the source website's pagination pattern)
                if (page > 1) {
                    if (pageUrl.contains("?")) {
                        pageUrl += "&page=" + page;
                    } else if (pageUrl.contains("danviet.vn")) {
                        // URL phân trang riêng cho Dân Việt
                        if (pageUrl.endsWith(".htm")) {
                            pageUrl = pageUrl.replace(".htm", "/trang" + page + ".htm");
                        } else if (pageUrl.endsWith("/")) {
                            pageUrl = pageUrl + "trang" + page;
                        } else {
                            pageUrl = pageUrl + "/trang" + page;
                        }
                    } else if (pageUrl.contains("nongnghiep.vn")) {
                        // URL phân trang riêng cho Báo Nông Nghiệp
                        if (pageUrl.endsWith("/")) {
                            pageUrl = pageUrl + "p" + page;
                        } else {
                            pageUrl = pageUrl + "/p" + page;
                        }
                    } else if (pageUrl.contains(".htm") || pageUrl.contains(".html")) {
                        // Xử lý chung cho các trang có đuôi .htm/.html
                        if (pageUrl.contains("/trang")) {
                            // Nếu đã có "/trangX" thì thay thế số trang
                            pageUrl = pageUrl.replaceAll("/trang\\d+", "/trang" + page);
                        } else {
                            // Nếu chưa có thì thêm mới
                            pageUrl = pageUrl.replace(".htm", "/trang" + page + ".htm").replace(".html", "/trang" + page + ".html");
                        }
                    } else {
                        pageUrl += "/page/" + page;
                    }
                }
                
                log.info("Fetching page {} from source: {}", page, pageUrl);
                
                Document doc = null;
                try {
                    doc = Jsoup.connect(pageUrl)
                            .userAgent(userAgent)
                            .timeout(15000) // Increase timeout to 15 seconds
                            .get();
                } catch (IOException e) {
                    log.error("Error connecting to page {}: {}", pageUrl, e.getMessage());
                    continue; // Skip to next page instead of failing completely
                }

                if (doc == null) {
                    continue;
                }

                // Use the configured selector first
                Elements articleElements = doc.select(source.getArticleSelector());
                
                // If no elements found, try alternative selectors based on the website domain
                if (articleElements.isEmpty()) {
                    log.info("No articles found with configured selector: {}. Trying alternative selectors...", source.getArticleSelector());
                    
                    // Specific selectors for known websites
                    if (pageUrl.contains("nongnghiep.vn")) {
                        articleElements = doc.select(".story-item, article, .story, .item, .news-item, .box-item, .list-news li, div[class*=list-news], div[class*=category] article");
                        log.info("Trying nongnghiep.vn specific selectors, found: {}", articleElements.size());
                    } else if (pageUrl.contains("danviet.vn")) {
                        articleElements = doc.select(".list-news article, .story, .item, .box-news-item, .item-list, .box-category-item, .list-news .item, .news-item");
                        log.info("Trying danviet.vn specific selectors, found: {}", articleElements.size());
                    } else if (pageUrl.contains("vietnamnet.vn")) {
                        articleElements = doc.select(".item-news, .list-content article, .box-item-post, .item, .vnn-card");
                        log.info("Trying vietnamnet.vn specific selectors, found: {}", articleElements.size());
                    } else if (pageUrl.contains("baomoi.com")) {
                        articleElements = doc.select(".bm_c .bm_S, .story, .article-item, .bm_BS");
                        log.info("Trying baomoi.com specific selectors, found: {}", articleElements.size());
                    }
                    
                    // Thử các bộ chọn phổ biến khác nếu vẫn không tìm thấy
                    if (articleElements.isEmpty()) {
                        String[] commonSelectors = {
                            "article", ".article", ".story", ".news-item", ".list-news .item", 
                            ".cate-content article", ".item-news", ".news-card", ".article-item",
                            ".box-item-post", ".card", ".story-item", ".entry", ".news",
                            "div[class*=article]", "div[class*=news-item]", "div[class*=story]", 
                            "div[class*=card]", "div[class*=box] article", "div[class*=post]",
                            ".item", ".list-item", ".news-box", ".featured-news", ".list-news-home .item"
                        };
                        
                        for (String selector : commonSelectors) {
                            articleElements = doc.select(selector);
                            if (!articleElements.isEmpty()) {
                                log.info("Found {} articles with alternative selector: {}", articleElements.size(), selector);
                                break;
                            }
                        }
                    }

                    // Thử tìm các phần tử <a> có href và tiêu đề nếu vẫn không tìm thấy gì
                    if (articleElements.isEmpty()) {
                        log.info("Still no articles found, trying to find links with titles...");
                        Elements links = doc.select("a[href]:has(img)");
                        if (!links.isEmpty()) {
                            log.info("Found {} links with images", links.size());
                            articleElements = links;
                        }
                    }
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

                        if (title.isEmpty()) {
                            log.debug("Skipping article with missing title: {}", articleUrl);
                            continue;
                        }
                        
                        // Kiểm tra nội dung có phải là placeholder hay không
                        if (content.isEmpty() || content.length() < 100) {
                            log.info("Article content is too short or empty for: {}", articleUrl);
                            // Cố gắng trích xuất nội dung trực tiếp từ toàn bộ body nếu không tìm thấy qua selector
                            content = extractHtmlWithFallback(articleDoc, "body", "");
                            
                            // Loại bỏ header, footer và các phần không liên quan
                            content = cleanupArticleContent(content, articleDoc);
                            
                            // Nếu sau khi cố gắng vẫn không có nội dung hợp lệ, bỏ qua bài viết này
                            if (content.isEmpty() || content.length() < 100) {
                                log.debug("Could not extract valid content, skipping article: {}", articleUrl);
                                continue;
                            }
                        }
                        
                        // Hậu xử lý nội dung để đảm bảo định dạng
                        content = postprocessContent(content);

                        // Lưu bài viết
                        News news = News.builder()
                                .title(title)
                                .summary(summary)
                                .content(content)
                                .imageUrl(imageUrl)
                                .sourceUrl(articleUrl)
                                .sourceName(source.getName())
                                .publishedDate(publishedDate != null ? publishedDate : LocalDateTime.now())
                                .category(source.getCategory())
                                .uniqueId(uniqueId)
                                .active(true)
                                .build();

                        validateAndFixNewsDate(news);

                        try {
                            newsRepository.save(news);
                            articlesSaved++;
                            log.info("Saved article: {} from {}", title, source.getName());
                        } catch (Exception saveEx) {
                            // Kiểm tra nếu là lỗi duplicate entry (uniqueId đã tồn tại)
                            if (saveEx.getMessage() != null && (
                                saveEx.getMessage().contains("Duplicate entry") || 
                                saveEx.getMessage().contains("duplicate key") ||
                                saveEx.getMessage().contains("unique_id") ||
                                saveEx.getMessage().contains("ConstraintViolation"))) {
                                log.debug("Article with uniqueId {} already exists, skipping", uniqueId);
                            } else {
                                // Nếu là lỗi khác, log chi tiết
                                log.error("Error saving article from {}: {}", source.getName(), saveEx.getMessage());
                            }
                        }

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
            
        } catch (Exception e) {
            log.error("Unexpected error fetching news from {}: {}", source.getName(), e.getMessage(), e);
            
            // Nếu có lỗi khác, thêm dữ liệu mẫu
            addSampleNewsForSource(source);
            
            throw new RuntimeException("Failed to fetch news from source: " + source.getName(), e);
        }
    }

    private void addSampleNewsForSource(NewsSource source) {
        log.info("Không tìm thấy bài viết từ nguồn {}, thêm dữ liệu mẫu tạm thời...", source.getName());
        
        try {
            // Kiểm tra xem đã có bài viết thật của nguồn này chưa
            long existingCount = newsRepository.countBySourceNameAndUniqueIdNotLike(source.getName(), "sample-%");
            if (existingCount > 0) {
                log.info("Đã có {} bài viết thật từ nguồn {}, không thêm dữ liệu mẫu", existingCount, source.getName());
                return;
            }
            
            // Tạo 3 bài viết mẫu (giảm từ 5 xuống 3)
            for (int i = 1; i <= 3; i++) {
                String title = "Tin tức nông nghiệp #" + i + " từ " + source.getName();
                String content = "<div class='sample-notice' style='background-color: #fff3cd; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 5px solid #ffc107;'>" +
                        "<h4 style='color: #856404;'>⚠️ Đây là nội dung mẫu tạm thời</h4>" +
                        "<p>Hệ thống đang trong quá trình cào dữ liệu thực từ nguồn tin " + source.getName() + "</p>" +
                        "<p>Lý do có thể do:</p>" +
                        "<ul>" +
                        "<li>Trang tin đã thay đổi cấu trúc HTML</li>" +
                        "<li>Bộ chọn CSS không còn phù hợp</li>" +
                        "<li>Trang web chặn việc crawl dữ liệu</li>" +
                        "<li>Vấn đề kết nối mạng</li>" +
                        "</ul>" +
                        "<p><strong>Hành động:</strong> Vui lòng thông báo cho quản trị viên hoặc nhấn nút \"Xóa dữ liệu mẫu\" trên trang tin tức để hệ thống tự động cập nhật.</p>" +
                        "</div>" +
                        "<p>Đây là nội dung tin tức nông nghiệp mẫu #" + i + " từ " + source.getName() + ".</p>" +
                        "<p>Nội dung này được tạo tự động khi không thể crawl được dữ liệu từ nguồn tin.</p>" +
                        "<p>Hệ thống sẽ cố gắng crawl lại dữ liệu thực vào lần sau.</p>";
                String summary = "Đây là nội dung mẫu tạm thời. Hệ thống đang gặp vấn đề khi trích xuất nội dung từ " + source.getName();
                
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
        
        // Lọc các URL không phải bài viết
        if (href.contains("/lien-he") || href.contains("#") || 
            href.endsWith("/") || href.contains("mailto:") || 
            href.contains("/tag/") || href.contains("/tags/") ||
            href.contains("/page/") || href.contains("/search/") ||
            href.contains("/category/") || href.contains("/author/") ||
            href.contains("/about/")) {
            log.debug("Skipping non-article URL: {}", href);
            return null;
        }

        // Kiểm tra xem URL đã đầy đủ chưa
        if (href.startsWith("http")) {
            // Kiểm tra thêm cho domain danviet.vn
            if (baseUrl.contains("danviet.vn")) {
                // Chỉ lấy các bài viết trong chính trang danviet.vn và có định dạng bài viết
                if (!href.contains("danviet.vn") || !href.matches(".*?-\\d+\\.html?$|.*?/\\d+\\.html?$")) {
                    log.debug("Skipping non-article URL from danviet.vn: {}", href);
                    return null;
                }
            }
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
            // Thử nhiều selectors cho date element
            Element dateElement = null;
            
            // Sử dụng selector được cấu hình
            dateElement = doc.selectFirst(source.getDateSelector());
            
            // Thử các selectors phổ biến nếu không tìm thấy
            if (dateElement == null) {
                String[] commonDateSelectors = {
                    ".time", ".date", ".datetime", ".published-date", ".post-date", ".article-date", 
                    ".news-date", ".entry-date", ".time-public", ".date-time", ".time-info",
                    "time", "[itemprop=datePublished]", ".article-time", ".news-time", ".publish-time"
                };
                
                for (String selector : commonDateSelectors) {
                    dateElement = doc.selectFirst(selector);
                    if (dateElement != null) {
                        break;
                    }
                }
            }
            
            if (dateElement == null) {
                return defaultDate;
            }

            String dateText = dateElement.text().trim();
            if (dateText.isEmpty() && dateElement.hasAttr("datetime")) {
                // Thử lấy từ thuộc tính datetime
                dateText = dateElement.attr("datetime").trim();
            }
            
            if (dateText.isEmpty() && dateElement.hasAttr("content")) {
                // Thử lấy từ thuộc tính content (đôi khi dùng cho metadata)
                dateText = dateElement.attr("content").trim();
            }
            
            if (dateText.isEmpty()) {
                return defaultDate;
            }
            
            // Tiền xử lý văn bản ngày tháng
            dateText = preprocessDateText(dateText);
            
            log.debug("Extracted date text: {}", dateText);
            
            // Sử dụng định dạng từ cấu hình nguồn tin
            if (source.getDateFormat() != null && !source.getDateFormat().isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(source.getDateFormat());
                    return LocalDateTime.parse(dateText, formatter);
                } catch (DateTimeParseException e) {
                    log.error("Error parsing date with format: {}, date text: {}", source.getDateFormat(), dateText, e);
                    // Continue to try with common formats
                }
            }

            // Thử một số định dạng phổ biến của Việt Nam và quốc tế
            String[] commonFormats = {
                "yyyy-MM-dd HH:mm:ss",
                "yyyy-MM-dd'T'HH:mm:ss",
                "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                "yyyy-MM-dd HH:mm",
                "yyyy/MM/dd HH:mm:ss",
                "yyyy/MM/dd HH:mm",
                "dd/MM/yyyy HH:mm:ss",
                "dd/MM/yyyy HH:mm",
                "dd-MM-yyyy HH:mm:ss",
                "dd-MM-yyyy HH:mm",
                "dd/MM/yyyy",
                "dd-MM-yyyy",
                "MM/dd/yyyy HH:mm:ss",
                "MM/dd/yyyy HH:mm",
                "MM/dd/yyyy",
                "yyyy-MM-dd",
                "HH:mm - dd/MM/yyyy",
                "HH:mm - dd-MM-yyyy",
                "HH:mm dd/MM/yyyy",
                "HH:mm dd-MM-yyyy"
            };

            for (String format : commonFormats) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
                    return LocalDateTime.parse(dateText, formatter);
                } catch (DateTimeParseException e) {
                    // Continue with next format
                }
            }
            
            // Xử lý đặc biệt cho các định dạng ngày giờ tiếng Việt
            try {
                return parseVietnameseDateFormat(dateText);
            } catch (Exception e) {
                log.debug("Failed to parse Vietnamese date format: {}", dateText);
            }

            // Nếu không thể chuyển đổi, trả về thời gian hiện tại
            log.warn("Could not parse date: '{}' for source: {}, using default date instead", 
                    dateText, source.getName());
            return defaultDate;
        } catch (Exception e) {
            log.error("Error extracting date: {}", e.getMessage());
            return defaultDate;
        }
    }

    /**
     * Tiền xử lý chuỗi ngày tháng để chuẩn hóa trước khi phân tích
     */
    private String preprocessDateText(String dateText) {
        if (dateText == null || dateText.isEmpty()) {
            return "";
        }
        
        // Loại bỏ từ "Cập nhật:", "Đăng:", "Đăng ngày", "Đăng lúc", "Ngày đăng:"
        dateText = dateText.replaceAll("(?i)(Cập nhật|Đăng|Ngày đăng|Đăng ngày|Đăng lúc|Xuất bản|Ngày xuất bản|Ngày|Published|Updated)\\s*:?\\s*", "").trim();
        
        // Loại bỏ phần GMT+7, ICT, etc.
        dateText = dateText.replaceAll("(?i)\\s*(GMT|UTC)\\s*[+-]\\d+", "").trim();
        dateText = dateText.replaceAll("(?i)\\s*ICT", "").trim();
        
        // Loại bỏ phần ngày trong tuần (Thứ 2, Thứ Hai, Monday, v.v.)
        dateText = dateText.replaceAll("(?i)(Thứ\\s*[Hh]ai|Thứ\\s*[Bb]a|Thứ\\s*[Tt]ư|Thứ\\s*[Nn]ăm|Thứ\\s*[Ss]áu|Thứ\\s*[Bb]ảy|Chủ\\s*[Nn]hật|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Thứ\\s*\\d+),?\\s*", "").trim();
        
        // Chuẩn hóa dấu ngăn cách
        dateText = dateText.replaceAll("\\s+", " ").trim();
        
        return dateText;
    }

    /**
     * Phân tích các định dạng ngày tháng tiếng Việt phổ biến
     */
    private LocalDateTime parseVietnameseDateFormat(String dateText) {
        // Xử lý định dạng "HH:mm - ngày dd/MM/yyyy"
        if (dateText.matches("\\d{1,2}:\\d{2}\\s*-\\s*ngày\\s*\\d{1,2}/\\d{1,2}/\\d{4}")) {
            String[] parts = dateText.split("\\s*-\\s*ngày\\s*");
            String time = parts[0];
            String date = parts[1];
            
            String[] timeParts = time.split(":");
            String[] dateParts = date.split("/");
            
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);
            int day = Integer.parseInt(dateParts[0]);
            int month = Integer.parseInt(dateParts[1]);
            int year = Integer.parseInt(dateParts[2]);
            
            return LocalDateTime.of(year, month, day, hour, minute);
        }
        
        // Xử lý định dạng "ngày dd tháng MM năm yyyy"
        if (dateText.matches("(?i)ngày\\s*\\d{1,2}\\s*tháng\\s*\\d{1,2}\\s*năm\\s*\\d{4}.*")) {
            dateText = dateText.replaceAll("(?i)ngày\\s*(\\d{1,2})\\s*tháng\\s*(\\d{1,2})\\s*năm\\s*(\\d{4}).*", "$1/$2/$3");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d/M/yyyy");
            return LocalDateTime.parse(dateText + " 00:00", DateTimeFormatter.ofPattern("d/M/yyyy HH:mm"));
        }
        
        // Xử lý định dạng "dd/MM/yyyy - HH:mm"
        if (dateText.matches("\\d{1,2}/\\d{1,2}/\\d{4}\\s*-\\s*\\d{1,2}:\\d{2}")) {
            String[] parts = dateText.split("\\s*-\\s*");
            String date = parts[0];
            String time = parts[1];
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d/M/yyyy HH:mm");
            return LocalDateTime.parse(date + " " + time, formatter);
        }
        
        throw new DateTimeParseException("Could not parse Vietnamese date format", dateText, 0);
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
        // Try the primary selector first
        try {
            Element element = doc.selectFirst(selector);
            if (element != null) {
                String html = element.html().trim();
                if (!html.isEmpty()) {
                    return html;
                }
            }
        } catch (Exception e) {
            log.warn("Error extracting HTML with primary selector: {}", selector, e);
        }
        
        // If primary selector failed, try fallback selectors
        if (fallbackSelectors != null && !fallbackSelectors.isEmpty()) {
            String[] selectors = fallbackSelectors.split(",");
            for (String fallbackSelector : selectors) {
                try {
                    Element element = doc.selectFirst(fallbackSelector.trim());
                    if (element != null) {
                        String html = element.html().trim();
                        if (!html.isEmpty()) {
                            log.info("Successfully extracted HTML with fallback selector: {}", fallbackSelector);
                            return html;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error extracting HTML with fallback selector: {}", fallbackSelector, e);
                }
            }
        }
        
        // If all specific selectors failed, try general content containers
        String[] generalContentSelectors = {
            ".content", ".article", ".entry-content", ".post-content", 
            ".news-content", "article", ".detail", ".body", ".main-content",
            "#content", "#main-content", ".main", ".container", ".article-body"
        };
        
        for (String generalSelector : generalContentSelectors) {
            try {
                Element element = doc.selectFirst(generalSelector);
                if (element != null) {
                    String html = element.html().trim();
                    if (!html.isEmpty() && html.length() > 200) { // Ensuring it's substantial content
                        log.info("Extracted content using general selector: {}", generalSelector);
                        return html;
                    }
                }
            } catch (Exception e) {
                // Ignore errors for general selectors
            }
        }
        
        // Last resort: try to get the main content area by excluding headers, footers, sidebars
        try {
            Element body = doc.body();
            if (body != null) {
                // Deep copy the body to avoid modifying the original document
                Element contentBody = body.clone();
                
                // Remove common non-content elements
                contentBody.select("header, footer, nav, .header, .footer, .navigation, .menu, .sidebar, .comment, .ad, .advertisement, script, style, .social, .share, .related, .recommendation").remove();
                
                String html = contentBody.html().trim();
                if (!html.isEmpty()) {
                    log.info("Extracted content by cleaning body element as last resort");
                    return html;
                }
            }
        } catch (Exception e) {
            log.error("Error extracting content as last resort", e);
        }
        
        // If everything failed, return empty string
        return "";
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

    /**
     * Hàm này loại bỏ các phần không cần thiết từ nội dung bài viết
     * như header, footer, menu, quảng cáo, v.v.
     */
    private String cleanupArticleContent(String content, Document doc) {
        if (content.isEmpty()) {
            return "";
        }
        
        // Tạo một Document mới từ content
        Document contentDoc = Jsoup.parse(content);
        
        // Loại bỏ các phần không liên quan
        contentDoc.select("script, style, iframe, .advertisement, .ads, .banner, .header, .footer, .navigation, .nav, .menu, .social-media, .share, .related, .comments, .sidebar, .widget, form, .modal").remove();
        
        // Loại bỏ các thẻ có thuộc tính ẩn
        contentDoc.select("[style*=display:none], [style*=display: none], [hidden], [aria-hidden=true]").remove();
        
        // Loại bỏ các phần không cần thiết bằng cách phát hiện các lớp và ID phổ biến
        contentDoc.select(".share, .share-social, .share-buttons, .sharing, #sharing, .social-share, .social-icons, .post-share, .share-box").remove();
        contentDoc.select(".related, .related-posts, .related-articles, .see-also, .recommend, .recommendations").remove();
        contentDoc.select(".comments, .comment-section, .comment-box, #comments, .post-comments").remove();
        contentDoc.select(".tags, .tag-list, .post-tags, .article-tags, .tagging").remove();
        contentDoc.select(".author, .author-info, .author-bio, .post-author, .article-author").remove();
        contentDoc.select(".rating, .vote, .likes, .post-rating, .article-rating").remove();
        contentDoc.select(".newsletter, .subscribe, .subscription, .sign-up, .follow-us").remove();
        contentDoc.select(".popup, .modal, .overlay, .lightbox").remove();
        contentDoc.select(".cookie, .cookie-notice, .cookie-banner, .gdpr").remove();
        
        // Loại bỏ các thẻ có từ khóa quảng cáo trong class hoặc id
        contentDoc.select("[class*=advert], [class*=banner], [class*=promo], [id*=banner], [id*=advert], [id*=promo]").remove();
        
        // Loại bỏ các thẻ liên kết và nút không cần thiết
        contentDoc.select("a.btn, button, .button, .btn").removeAttr("onclick").removeAttr("href");
        
        // Loại bỏ các thuộc tính không cần thiết của các thẻ
        Elements allElements = contentDoc.getAllElements();
        for (Element el : allElements) {
            el.removeAttr("onclick");
            el.removeAttr("onload");
            el.removeAttr("onmouseover");
            el.removeAttr("onmouseout");
            el.removeAttr("data-src");
            el.removeAttr("data-lazy-src");
            el.removeAttr("srcset");
            el.removeAttr("data-srcset");
            el.removeAttr("data-lazy-srcset");
            el.removeAttr("data-original");
        }
        
        // Xử lý các thẻ img để đảm bảo path chính xác
        Elements images = contentDoc.select("img");
        for (Element img : images) {
            String src = img.attr("src");
            if (src.isEmpty() && img.hasAttr("data-src")) {
                src = img.attr("data-src");
                img.attr("src", src);
            }
            
            // Kiểm tra xem src có phải URL đầy đủ không
            if (!src.isEmpty() && !src.startsWith("http") && !src.startsWith("data:")) {
                try {
                    String baseUrl = doc.baseUri();
                    if (baseUrl.isEmpty()) {
                        continue;
                    }
                    
                    if (src.startsWith("/")) {
                        java.net.URL url = new java.net.URL(baseUrl);
                        String domain = url.getProtocol() + "://" + url.getHost();
                        img.attr("src", domain + src);
                    } else {
                        img.attr("src", baseUrl + "/" + src);
                    }
                } catch (Exception e) {
                    // Bỏ qua lỗi khi xử lý URL
                }
            }
        }
        
        // Lấy nội dung HTML đã làm sạch
        String cleanContent = contentDoc.body().html();
        
        // Loại bỏ các dòng trống và khoảng trắng dư thừa
        cleanContent = cleanContent.replaceAll("(?m)^[ \t]*\r?\n", "").trim();
        
        // Nếu nội dung quá ngắn, có thể đã lọc quá mức, trả về nội dung gốc
        if (cleanContent.length() < 100 && content.length() > 100) {
            return content;
        }
        
        return cleanContent;
    }
    
    /**
     * Hậu xử lý nội dung để cải thiện định dạng và loại bỏ các phần không mong muốn
     */
    private String postprocessContent(String content) {
        try {
            // Tạo Document từ nội dung HTML
            Document doc = Jsoup.parse(content);
            
            // Loại bỏ các thuộc tính không cần thiết để làm sạch mã HTML
            doc.select("*").removeAttr("style").removeAttr("class").removeAttr("id");
            
            // Loại bỏ iframe, script, style, các phần liên quan đến comments và share
            doc.select("iframe, script, style, .comments, .comment, .share, .social, .related, .tags, [id*=comment], [class*=comment], [id*=social], [class*=social]").remove();
            
            // Giữ lại các thẻ có ý nghĩa
            String cleanHtml = doc.body().html();
            
            // Thay thế nhiều dòng trống bằng một dòng
            cleanHtml = cleanHtml.replaceAll("(?m)^[ \t]*\r?\n", "\n");
            
            // Thêm các thiết lập để hiển thị hình ảnh đúng kích thước
            cleanHtml = cleanHtml.replaceAll("<img", "<img style=\"max-width:100%; height:auto;\"");
            
            return cleanHtml;
        } catch (Exception e) {
            log.error("Error post-processing content", e);
            return content; // Trả về nội dung gốc nếu có lỗi
        }
    }

    @Override
    @Transactional
    public int removeSampleNews() {
        log.info("Đang xóa tất cả các tin tức mẫu...");
        long count = newsRepository.countByUniqueIdLike("sample-%");
        log.info("Tìm thấy {} tin tức mẫu để xóa", count);
        
        int deleted = newsRepository.deleteByUniqueIdLike("sample-%");
        log.info("Đã xóa {} tin tức mẫu", deleted);
        
        return deleted;
    }
    
    @Override
    @Transactional
    public void forceFetchNewsFromSources() {
        log.info("Bắt đầu cưỡng chế tải lại tin tức từ tất cả các nguồn...");
        
        List<NewsSource> sources = newsSourceRepository.findAllByActiveTrue();
        if (sources.isEmpty()) {
            log.warn("Không tìm thấy nguồn tin nào được kích hoạt.");
            return;
        }
        
        log.info("Tìm thấy {} nguồn tin đang hoạt động", sources.size());
        
        for (NewsSource source : sources) {
            try {
                forceFetchNewsFromSource(source);
            } catch (Exception e) {
                log.error("Lỗi khi tải tin tức từ nguồn {}: {}", source.getName(), e.getMessage(), e);
            }
        }
    }
    
    /**
     * Cưỡng chế tải lại tin tức từ một nguồn cụ thể, bỏ qua việc kiểm tra bài viết đã tồn tại
     */
    private void forceFetchNewsFromSource(NewsSource source) {
        log.info("Cưỡng chế tải tin tức từ nguồn: {}", source.getName());
        try {
            log.info("Đang tải tin tức từ URL: {}", source.getUrl());
            String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
            
            int maxPages = 3;  // Giới hạn số trang tải về
            int articlesFound = 0;
            int articlesSaved = 0;
            
            for (int page = 1; page <= maxPages; page++) {
                String pageUrl = source.getUrl();
                if (page > 1) {
                    if (pageUrl.contains("?")) {
                        pageUrl += "&page=" + page;
                    } else if (pageUrl.contains("danviet.vn")) {
                        // URL phân trang riêng cho Dân Việt
                        if (pageUrl.endsWith(".htm")) {
                            pageUrl = pageUrl.replace(".htm", "/trang" + page + ".htm");
                        } else if (pageUrl.endsWith("/")) {
                            pageUrl = pageUrl + "trang" + page;
                        } else {
                            pageUrl = pageUrl + "/trang" + page;
                        }
                    } else if (pageUrl.contains("nongnghiep.vn")) {
                        // URL phân trang riêng cho Báo Nông Nghiệp
                        if (pageUrl.endsWith("/")) {
                            pageUrl = pageUrl + "p" + page;
                        } else {
                            pageUrl = pageUrl + "/p" + page;
                        }
                    } else if (pageUrl.contains(".htm") || pageUrl.contains(".html")) {
                        // Xử lý chung cho các trang có đuôi .htm/.html
                        if (pageUrl.contains("/trang")) {
                            // Nếu đã có "/trangX" thì thay thế số trang
                            pageUrl = pageUrl.replaceAll("/trang\\d+", "/trang" + page);
                        } else {
                            // Nếu chưa có thì thêm mới
                            pageUrl = pageUrl.replace(".htm", "/trang" + page + ".htm").replace(".html", "/trang" + page + ".html");
                        }
                    } else {
                        pageUrl += "/page/" + page;
                    }
                }
                
                log.info("Tải trang {}: {}", page, pageUrl);
                
                // Tải trang web với retry mechanism
                Document doc = null;
                int maxRetries = 3;
                for (int retry = 0; retry < maxRetries; retry++) {
                    try {
                        doc = Jsoup.connect(pageUrl)
                                .userAgent(userAgent)
                                .timeout(10000)
                                .get();
                        break;
                    } catch (IOException e) {
                        if (retry == maxRetries - 1) {
                            throw e;
                        }
                        log.warn("Không thể tải trang, thử lại ({}/{}): {}", retry + 1, maxRetries, pageUrl);
                        Thread.sleep(1000);
                    }
                }
                
                if (doc == null) {
                    log.error("Không thể tải trang sau {} lần thử: {}", maxRetries, pageUrl);
                    break;
                }
                
                Elements articleElements = doc.select(source.getArticleSelector());
                
                // Nếu không tìm thấy bài viết, thử sử dụng các selector phổ biến
                if (articleElements.isEmpty()) {
                    log.info("Không tìm thấy bài viết nào với selector {}, thử với các selector phổ biến", source.getArticleSelector());
                    
                    if (pageUrl.contains("nongnghiep.vn")) {
                        articleElements = doc.select(".story-item, article, .story, .item, .news-item, .box-item, .list-news li, div[class*=list-news], div[class*=category] article");
                        log.info("Trying nongnghiep.vn specific selectors, found: {}", articleElements.size());
                    } else if (pageUrl.contains("danviet.vn")) {
                        articleElements = doc.select(".list-news article, .story, .item, .box-news-item, .item-list, .box-category-item, .list-news .item, .news-item");
                        log.info("Trying danviet.vn specific selectors, found: {}", articleElements.size());
                    } else if (pageUrl.contains("vietnamnet.vn")) {
                        articleElements = doc.select(".item-news, .list-content article, .box-item-post, .item, .vnn-card");
                        log.info("Trying vietnamnet.vn specific selectors, found: {}", articleElements.size());
                    } else if (pageUrl.contains("baomoi.com")) {
                        articleElements = doc.select(".bm_c .bm_S, .story, .article-item, .bm_BS");
                        log.info("Trying baomoi.com specific selectors, found: {}", articleElements.size());
                    }
                    
                    // Thử các bộ chọn phổ biến khác nếu vẫn không tìm thấy
                    if (articleElements.isEmpty()) {
                        String[] commonSelectors = {
                            "article", ".article", ".story", ".news-item", ".list-news .item", 
                            ".cate-content article", ".item-news", ".news-card", ".article-item",
                            ".box-item-post", ".card", ".story-item", ".entry", ".news",
                            "div[class*=article]", "div[class*=news-item]", "div[class*=story]", 
                            "div[class*=card]", "div[class*=box] article", "div[class*=post]",
                            ".item", ".list-item", ".news-box", ".featured-news", ".list-news-home .item"
                        };
                        
                        for (String selector : commonSelectors) {
                            articleElements = doc.select(selector);
                            if (!articleElements.isEmpty()) {
                                log.info("Found {} articles with alternative selector: {}", articleElements.size(), selector);
                                break;
                            }
                        }
                    }

                    // Thử tìm các phần tử <a> có href và tiêu đề nếu vẫn không tìm thấy gì
                    if (articleElements.isEmpty()) {
                        log.info("Still no articles found, trying to find links with titles...");
                        Elements links = doc.select("a[href]:has(img)");
                        if (!links.isEmpty()) {
                            log.info("Found {} links with images", links.size());
                            articleElements = links;
                        }
                    }
                }
                
                log.info("Tìm thấy {} bài viết trên trang {}", articleElements.size(), page);
                articlesFound += articleElements.size();
                
                for (Element articleElement : articleElements) {
                    try {
                        String articleUrl = getArticleUrl(articleElement, pageUrl);
                        if (articleUrl == null || articleUrl.isEmpty()) {
                            continue;
                        }

                        log.debug("Đang xử lý bài viết: {}", articleUrl);
                        
                        // Tải nội dung bài viết
                        Document articleDoc = null;
                        for (int retry = 0; retry < maxRetries; retry++) {
                            try {
                                articleDoc = Jsoup.connect(articleUrl)
                                        .userAgent(userAgent)
                                        .timeout(15000)
                                        .get();
                                break;
                            } catch (IOException e) {
                                if (retry == maxRetries - 1) {
                                    throw e;
                                }
                                log.warn("Không thể tải bài viết, thử lại ({}/{}): {}", retry + 1, maxRetries, articleUrl);
                                Thread.sleep(1000);
                            }
                        }
                        
                        if (articleDoc == null) {
                            continue;
                        }

                        // Trích xuất thông tin bài viết
                        String title = extractTextWithFallback(articleDoc, source.getTitleSelector(), "h1.title, h1.detail-title, h1.article-title, .title, .detail-title");
                        String summary = source.getSummarySelector() != null ? 
                                extractTextWithFallback(articleDoc, source.getSummarySelector(), "h2.sapo, .detail-sapo, .article-sapo, .summary, .sapo") : "";
                        String content = source.getContentSelector() != null ? 
                                extractHtmlWithFallback(articleDoc, source.getContentSelector(), "div.detail-content, .article-body, .content-detail, .article-content") : "";
                        String imageUrl = source.getImageSelector() != null ? 
                                extractImageUrlWithFallback(articleDoc, source.getImageSelector(), "div.detail-content img, .article-body img, .content-news img", source.getUrl()) : "";
                        LocalDateTime publishedDate = extractDate(articleDoc, source, LocalDateTime.now());

                        if (title.isEmpty()) {
                            continue;
                        }
                        
                        // Kiểm tra nội dung có phải là placeholder hay không
                        if (content.isEmpty() || content.length() < 100) {
                            log.info("Nội dung bài viết quá ngắn hoặc trống: {}", articleUrl);
                            content = extractHtmlWithFallback(articleDoc, "body", "");
                            content = cleanupArticleContent(content, articleDoc);
                            
                            if (content.isEmpty() || content.length() < 100) {
                                continue;
                            }
                        }
                        
                        content = postprocessContent(content);
                        
                        // Tạo uniqueId
                        String uniqueId = generateUniqueId(articleUrl);
                        
                        // Kiểm tra xem bài viết đã tồn tại chưa
                        Optional<News> existingNews = newsRepository.findByUniqueId(uniqueId);
                        
                        if (existingNews.isPresent()) {
                            // Nếu là bài viết đã tồn tại, cập nhật nội dung
                            News existing = existingNews.get();
                            existing.setTitle(title);
                            existing.setSummary(summary);
                            existing.setContent(content);
                            if (!imageUrl.isEmpty()) {
                                existing.setImageUrl(imageUrl);
                            }
                            existing.setPublishedDate(publishedDate != null ? publishedDate : LocalDateTime.now());
                            existing.setActive(true);
                            
                            // Validate and fix the date
                            validateAndFixNewsDate(existing);

                            try {
                                newsRepository.save(existing);
                                articlesSaved++;
                                log.info("Đã cập nhật bài viết: {}", title);
                            } catch (Exception saveEx) {
                                // Kiểm tra nếu là lỗi duplicate entry (uniqueId đã tồn tại)
                                if (saveEx.getMessage() != null && (
                                    saveEx.getMessage().contains("Duplicate entry") || 
                                    saveEx.getMessage().contains("duplicate key") ||
                                    saveEx.getMessage().contains("unique_id") ||
                                    saveEx.getMessage().contains("ConstraintViolation"))) {
                                    log.debug("Article with uniqueId {} already exists, skipping", uniqueId);
                                } else {
                                    // Nếu là lỗi khác, log chi tiết
                                    log.error("Error saving article from {}: {}", source.getName(), saveEx.getMessage());
                                }
                            }
                        } else {
                            // Tạo bài viết mới
                            News news = News.builder()
                                    .title(title)
                                    .summary(summary)
                                    .content(content)
                                    .imageUrl(imageUrl)
                                    .sourceUrl(articleUrl)
                                    .sourceName(source.getName())
                                    .publishedDate(publishedDate != null ? publishedDate : LocalDateTime.now())
                                    .category(source.getCategory())
                                    .uniqueId(uniqueId)
                                    .active(true)
                                    .build();
                            
                            validateAndFixNewsDate(news);

                            try {
                                newsRepository.save(news);
                                articlesSaved++;
                                log.info("Saved article: {} from {}", title, source.getName());
                            } catch (Exception saveEx) {
                                // Kiểm tra nếu là lỗi duplicate entry (uniqueId đã tồn tại)
                                if (saveEx.getMessage() != null && (
                                    saveEx.getMessage().contains("Duplicate entry") || 
                                    saveEx.getMessage().contains("duplicate key") ||
                                    saveEx.getMessage().contains("unique_id") ||
                                    saveEx.getMessage().contains("ConstraintViolation"))) {
                                    log.debug("Article with uniqueId {} already exists, skipping", uniqueId);
                                } else {
                                    // Nếu là lỗi khác, log chi tiết
                                    log.error("Error saving article from {}: {}", source.getName(), saveEx.getMessage());
                                }
                            }
                        }

                    } catch (Exception e) {
                        log.error("Lỗi khi xử lý bài viết: {}", e.getMessage());
                    }
                }
                
                if (articlesSaved > 0 && page < maxPages) {
                    // Đợi 2 giây trước khi tải trang tiếp theo
                    Thread.sleep(2000);
                }
            }
            
            log.info("Hoàn tất cào tin từ {}: tìm thấy {} bài viết, lưu {} bài viết mới", 
                    source.getName(), articlesFound, articlesSaved);
            
        } catch (Exception e) {
            log.error("Lỗi khi cào tin từ nguồn {}: {}", source.getName(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi cào tin từ nguồn: " + source.getName(), e);
        }
    }

    @Override
    @Transactional
    public int fixInvalidDates() {
        log.info("Bắt đầu cập nhật ngày tháng không hợp lệ cho các bài viết...");
        
        List<News> allNews = newsRepository.findAll();
        int updatedCount = 0;
        
        for (News news : allNews) {
            boolean needsUpdate = false;
            
            // Check if date is null
            if (news.getPublishedDate() == null) {
                needsUpdate = true;
            } else {
                // Check if date is in the future (likely invalid)
                if (news.getPublishedDate().isAfter(LocalDateTime.now().plusDays(1))) {
                    needsUpdate = true;
                }
                
                // Check if date is too old (before 2000) - likely invalid
                if (news.getPublishedDate().isBefore(LocalDateTime.of(2000, 1, 1, 0, 0))) {
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                // Set published date to current date minus a random hours/minutes for variety
                int randomHours = (int) (Math.random() * 48); // Random hours between 0-48
                news.setPublishedDate(LocalDateTime.now().minusHours(randomHours));
                newsRepository.save(news);
                updatedCount++;
            }
        }
        
        log.info("Đã cập nhật {} bài viết có ngày tháng không hợp lệ", updatedCount);
        return updatedCount;
    }

    /**
     * Validates and fixes news article dates that might be invalid
     * @param news The news article to check/fix
     */
    private void validateAndFixNewsDate(News news) {
        // If date is null, set to current time
        if (news.getPublishedDate() == null) {
            news.setPublishedDate(LocalDateTime.now());
            return;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // If date is in future (with 1 day buffer for timezone differences)
        if (news.getPublishedDate().isAfter(now.plusDays(1))) {
            news.setPublishedDate(now);
        }
        
        // If date is too old (before 2000) - likely invalid
        if (news.getPublishedDate().isBefore(LocalDateTime.of(2000, 1, 1, 0, 0))) {
            news.setPublishedDate(now);
        }
    }
} 