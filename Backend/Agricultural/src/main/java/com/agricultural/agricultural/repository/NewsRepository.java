package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    
    Optional<News> findByUniqueId(String uniqueId);
    
    boolean existsByUniqueId(String uniqueId);
    
    Page<News> findAllByActiveTrue(Pageable pageable);
    
    Page<News> findAllByActiveTrueAndCategoryIgnoreCase(String category, Pageable pageable);
    
    List<News> findTop10ByActiveTrueOrderByPublishedDateDesc();
    
    Page<News> findByTitleContainingIgnoreCaseAndActiveTrue(String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE News n SET n.active = false")
    void deactivateAllNews();
} 