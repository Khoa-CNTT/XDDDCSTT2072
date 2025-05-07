package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.NewsSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsSourceRepository extends JpaRepository<NewsSource, Long> {
    
    List<NewsSource> findAllByActiveTrue();
    
    List<NewsSource> findAllByActiveTrueAndCategoryIgnoreCase(String category);
} 