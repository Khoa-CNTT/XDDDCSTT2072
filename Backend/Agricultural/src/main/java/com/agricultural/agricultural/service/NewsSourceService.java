package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.NewsSourceDTO;

import java.util.List;

public interface NewsSourceService {
    
    List<NewsSourceDTO> getAllNewsSources();
    
    List<NewsSourceDTO> getActiveNewsSources();
    
    List<NewsSourceDTO> getNewsSourcesByCategory(String category);
    
    NewsSourceDTO getNewsSourceById(Long id);
    
    NewsSourceDTO createNewsSource(NewsSourceDTO newsSourceDTO);
    
    NewsSourceDTO updateNewsSource(Long id, NewsSourceDTO newsSourceDTO);
    
    void deleteNewsSource(Long id);
    
    void activateNewsSource(Long id);
    
    void deactivateNewsSource(Long id);
} 