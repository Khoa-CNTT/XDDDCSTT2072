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

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

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
        NewsDTO newsDTO = newsService.getNewsById(id);
        return ResponseEntity.ok(newsDTO);
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

    @PostMapping("/fetch")
    public ResponseEntity<String> fetchNewsFromAllSources() {
        newsService.fetchNewsFromSources();
        return ResponseEntity.ok("News fetching process started for all active sources");
    }

    @PostMapping("/fetch/{sourceId}")
    public ResponseEntity<String> fetchNewsFromSource(@PathVariable Long sourceId) {
        newsService.fetchNewsFromSource(sourceId);
        return ResponseEntity.ok("News fetching process started for source with ID: " + sourceId);
    }
} 