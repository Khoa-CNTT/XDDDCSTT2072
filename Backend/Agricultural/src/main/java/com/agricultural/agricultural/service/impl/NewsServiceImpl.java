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
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final NewsSourceRepository newsSourceRepository;
    private final NewsMapper newsMapper;

    @Override
    public Page<NewsDTO> getAllNews(Pageable pageable) {
        Page<News> newsPage = newsRepository.findAllByActiveTrue(pageable);
        return new PageImpl<>(
                newsMapper.toDTOList(newsPage.getContent()),
                pageable,
                newsPage.getTotalElements()
        );
    }

    @Override
    public Page<NewsDTO> getNewsByCategory(String category, Pageable pageable) {
        Page<News> newsPage = newsRepository.findAllByActiveTrueAndCategoryIgnoreCase(category, pageable);
        return new PageImpl<>(
                newsMapper.toDTOList(newsPage.getContent()),
                pageable,
                newsPage.getTotalElements()
        );
    }

    @Override
    public NewsDTO getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with id: " + id));
        return newsMapper.toDTO(news);
    }

    @Override
    public List<NewsDTO> getLatestNews() {
        List<News> latestNews = newsRepository.findTop10ByActiveTrueOrderByPublishedDateDesc();
        return newsMapper.toDTOList(latestNews);
    }

    @Override
    public Page<NewsDTO> searchNews(String keyword, Pageable pageable) {
        Page<News> newsPage = newsRepository.findByTitleContainingIgnoreCaseAndActiveTrue(keyword, pageable);
        return new PageImpl<>(
                newsMapper.toDTOList(newsPage.getContent()),
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
            Document doc = Jsoup.connect(source.getUrl())
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .timeout(10000)
                    .get();

            Elements articleElements = doc.select(source.getArticleSelector());
            for (Element articleElement : articleElements) {
                try {
                    String articleUrl = getArticleUrl(articleElement, source.getUrl());
                    if (articleUrl == null || articleUrl.isEmpty()) {
                        continue;
                    }

                    // Kiểm tra xem bài viết đã tồn tại chưa
                    String uniqueId = generateUniqueId(articleUrl);
                    if (newsRepository.existsByUniqueId(uniqueId)) {
                        log.debug("Article already exists: {}", articleUrl);
                        continue;
                    }

                    // Tải nội dung bài viết
                    Document articleDoc = Jsoup.connect(articleUrl)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                            .timeout(10000)
                            .get();

                    // Trích xuất thông tin bài viết
                    String title = extractText(articleDoc, source.getTitleSelector());
                    String summary = source.getSummarySelector() != null ? 
                            extractText(articleDoc, source.getSummarySelector()) : "";
                    String content = source.getContentSelector() != null ? 
                            extractHtml(articleDoc, source.getContentSelector()) : "";
                    String imageUrl = source.getImageSelector() != null ? 
                            extractImageUrl(articleDoc, source.getImageSelector(), source.getUrl()) : "";
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
                    log.info("Saved new article: {}", title);

                } catch (Exception e) {
                    log.error("Error processing article", e);
                }
            }
        } catch (IOException e) {
            log.error("Error connecting to source URL: {}", source.getUrl(), e);
            throw new RuntimeException("Failed to connect to news source: " + source.getName(), e);
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
                return "";
            }

            String src = imgElement.hasAttr("data-src") ? imgElement.attr("data-src") : imgElement.attr("src");
            if (src.isEmpty()) {
                return "";
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
                        return baseUrl + src;
                    }
                } else {
                    return baseUrl + "/" + src;
                }
            }
        } catch (Exception e) {
            log.error("Error extracting image URL with selector: {}", selector, e);
            return "";
        }
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
} 