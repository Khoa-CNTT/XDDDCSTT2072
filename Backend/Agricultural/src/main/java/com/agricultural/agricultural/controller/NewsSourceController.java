package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.NewsSourceDTO;
import com.agricultural.agricultural.service.NewsSourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/news-sources")
@RequiredArgsConstructor
public class NewsSourceController {

    private final NewsSourceService newsSourceService;

    @GetMapping
    public ResponseEntity<List<NewsSourceDTO>> getAllNewsSources() {
        List<NewsSourceDTO> sources = newsSourceService.getAllNewsSources();
        return ResponseEntity.ok(sources);
    }

    @GetMapping("/active")
    public ResponseEntity<List<NewsSourceDTO>> getActiveNewsSources() {
        List<NewsSourceDTO> activeSources = newsSourceService.getActiveNewsSources();
        return ResponseEntity.ok(activeSources);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<NewsSourceDTO>> getNewsSourcesByCategory(@PathVariable String category) {
        List<NewsSourceDTO> sources = newsSourceService.getNewsSourcesByCategory(category);
        return ResponseEntity.ok(sources);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsSourceDTO> getNewsSourceById(@PathVariable Long id) {
        NewsSourceDTO source = newsSourceService.getNewsSourceById(id);
        return ResponseEntity.ok(source);
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
} 