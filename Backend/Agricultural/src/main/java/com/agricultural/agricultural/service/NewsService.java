package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.NewsDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NewsService {
    
    Page<NewsDTO> getAllNews(Pageable pageable);
    
    Page<NewsDTO> getNewsByCategory(String category, Pageable pageable);
    
    NewsDTO getNewsById(Long id);
    
    List<NewsDTO> getLatestNews();
    
    Page<NewsDTO> searchNews(String keyword, Pageable pageable);
    
    NewsDTO createNews(NewsDTO newsDTO);
    
    NewsDTO updateNews(Long id, NewsDTO newsDTO);
    
    void deleteNews(Long id);
    
    void fetchNewsFromSources();
    
    void fetchNewsFromSource(Long sourceId);
    
    /**
     * Get the count of news articles in the database
     * @return The number of news articles
     */
    long getNewsCount();

    /**
     * Xóa toàn bộ tin tức trong database
     * @return Số lượng tin tức đã xóa
     */
    int deleteAllNews();
    
    /**
     * Finds and updates news articles with problematic image URLs
     */
    void fixProblematicImageUrls();
    
    /**
     * Xóa tất cả các tin tức mẫu (sample news)
     * @return Số lượng tin tức mẫu đã xóa
     */
    int removeSampleNews();
    
    /**
     * Cưỡng chế tải lại tin tức từ tất cả các nguồn, bỏ qua việc kiểm tra 
     * tin tức đã tồn tại
     */
    void forceFetchNewsFromSources();

    /**
     * Updates all news articles with invalid dates to current date
     * @return Number of articles updated
     */
    int fixInvalidDates();
} 