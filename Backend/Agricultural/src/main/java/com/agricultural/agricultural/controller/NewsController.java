package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.NewsDTO;
import com.agricultural.agricultural.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("${api.prefix}/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;
    private static final Logger log = LoggerFactory.getLogger(NewsController.class);

    @GetMapping
    public ResponseEntity<Page<NewsDTO>> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<NewsDTO> newsPage = newsService.getAllNews(pageable);
        return ResponseEntity.ok(newsPage);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<NewsDTO>> getNewsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<NewsDTO> newsPage = newsService.getNewsByCategory(category, pageable);
        return ResponseEntity.ok(newsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsDTO> getNewsById(@PathVariable Long id) {
        try {
            NewsDTO newsDTO = newsService.getNewsById(id);
            return ResponseEntity.ok(newsDTO);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<List<NewsDTO>> getLatestNews() {
        List<NewsDTO> latestNews = newsService.getLatestNews();
        return ResponseEntity.ok(latestNews);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<NewsDTO>> searchNews(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedDate"));
        Page<NewsDTO> newsPage = newsService.searchNews(keyword, pageable);
        return ResponseEntity.ok(newsPage);
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<NewsDTO> createNews(@RequestBody NewsDTO newsDTO) {
        NewsDTO createdNews = newsService.createNews(newsDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNews);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<NewsDTO> updateNews(@PathVariable Long id, @RequestBody NewsDTO newsDTO) {
        NewsDTO updatedNews = newsService.updateNews(id, newsDTO);
        return ResponseEntity.ok(updatedNews);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fetch")
    public ResponseEntity<String> fetchNewsGet() {
        return fetchNewsInternal();
    }

    @PostMapping("/fetch")
    public ResponseEntity<String> fetchNewsPost() {
        return fetchNewsInternal();
    }

    private ResponseEntity<String> fetchNewsInternal() {
        try {
            log.info("Bắt đầu thu thập tin tức từ các nguồn...");
            newsService.fetchNewsFromSources();
            log.info("Hoàn tất thu thập tin tức.");
            return ResponseEntity.ok("Đã thu thập tin tức thành công");
        } catch (Exception e) {
            log.error("Lỗi khi thu thập tin tức: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thu thập tin tức: " + e.getMessage());
        }
    }

    @GetMapping("/fetch/{sourceId}")
    public ResponseEntity<String> fetchNewsFromSourceGet(@PathVariable Long sourceId) {
        return fetchNewsFromSourceInternal(sourceId);
    }

    @PostMapping("/fetch/{sourceId}")
    public ResponseEntity<String> fetchNewsFromSourcePost(@PathVariable Long sourceId) {
        return fetchNewsFromSourceInternal(sourceId);
    }

    private ResponseEntity<String> fetchNewsFromSourceInternal(Long sourceId) {
        try {
            log.info("Bắt đầu thu thập tin tức từ nguồn có ID: {}", sourceId);
            newsService.fetchNewsFromSource(sourceId);
            log.info("Hoàn tất thu thập tin tức từ nguồn có ID: {}", sourceId);
            return ResponseEntity.ok("Đã thu thập tin tức thành công từ nguồn có ID: " + sourceId);
        } catch (Exception e) {
            log.error("Lỗi khi thu thập tin tức từ nguồn có ID {}: {}", sourceId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thu thập tin tức: " + e.getMessage());
        }
    }

    @DeleteMapping("/all")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<String> deleteAllNews() {
        try {
            int count = newsService.deleteAllNews();
            return ResponseEntity.ok("Đã xóa " + count + " tin tức");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa tin tức: " + e.getMessage());
        }
    }

    @GetMapping("/test-fetch")
    public ResponseEntity<String> testFetch() {
        try {
            log.info("Bắt đầu thử nghiệm thu thập tin tức từ tất cả các nguồn...");
            
            // Lấy số lượng tin tức trước khi thu thập
            long countBefore = newsService.getNewsCount();
            
            // Tiến hành thu thập tin tức
            newsService.fetchNewsFromSources();
            
            // Lấy số lượng tin tức sau khi thu thập
            long countAfter = newsService.getNewsCount();
            
            long newArticles = countAfter - countBefore;
            
            String message = String.format("Đã thu thập được %d tin tức mới. Tổng số tin tức hiện tại: %d", 
                    newArticles, countAfter);
            log.info(message);
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Lỗi khi thử nghiệm thu thập tin tức: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thử nghiệm thu thập tin tức: " + e.getMessage());
        }
    }

    @DeleteMapping("/clear-sample-data")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<String> clearSampleData() {
        try {
            log.info("Bắt đầu xóa dữ liệu mẫu và tải lại tin tức thật...");
            
            // Xóa dữ liệu mẫu
            int removed = newsService.removeSampleNews();
            
            // Tải lại tin tức
            newsService.fetchNewsFromSources();
            
            String message = String.format("Đã xóa %d tin tức mẫu và tải lại tin tức thật.", removed);
            log.info(message);
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Lỗi khi xóa dữ liệu mẫu: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa dữ liệu mẫu: " + e.getMessage());
        }
    }
    
    @PostMapping("/force-fetch")
    public ResponseEntity<String> forceFetchNews() {
        try {
            log.info("Bắt đầu cưỡng chế tải lại tin tức từ tất cả các nguồn...");
            
            // Tải lại tin tức với cờ bỏ qua kiểm tra bài viết đã tồn tại
            newsService.forceFetchNewsFromSources();
            
            String message = "Đã cưỡng chế tải lại tin tức từ tất cả các nguồn.";
            log.info(message);
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Lỗi khi cưỡng chế tải lại tin tức: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cưỡng chế tải lại tin tức: " + e.getMessage());
        }
    }
    
    @PostMapping("/fix-dates")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<String> fixInvalidDates() {
        try {
            log.info("Bắt đầu khắc phục vấn đề ngày tháng không hợp lệ...");
            
            // Trực tiếp cập nhật các ngày không hợp lệ trong database
            int updatedCount = newsService.fixInvalidDates();
            
            // Cập nhật selectors date cho nguồn tin
            RestTemplate restTemplate = new RestTemplate();
            String sourcesUpdateUrl = "http://localhost:8080/api/v1/news-sources/update-all-date-selectors";
            ResponseEntity<String> sourcesResponse = restTemplate.postForEntity(sourcesUpdateUrl, null, String.class);
            
            // Tải lại tin tức để có dữ liệu mới với date chính xác
            newsService.fixProblematicImageUrls();
            newsService.forceFetchNewsFromSources();
            
            String message = String.format("Đã cập nhật %d bài viết có ngày tháng không hợp lệ và tải lại tin tức mới.", updatedCount);
            log.info(message);
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Lỗi khi khắc phục vấn đề ngày tháng: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi khắc phục vấn đề ngày tháng: " + e.getMessage());
        }
    }
} 