package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    /**
     * Đếm số lượng bài viết thật (không phải dữ liệu mẫu) của một nguồn tin
     * @param sourceName Tên nguồn tin
     * @param pattern Mẫu uniqueId của dữ liệu mẫu (thường là "sample-%")
     * @return Số lượng bài viết thật của nguồn tin
     */
    long countBySourceNameAndUniqueIdNotLike(String sourceName, String pattern);
    
    /**
     * Tìm tất cả các tin tức mẫu (có uniqueId bắt đầu bằng 'sample-')
     * @return Danh sách các tin tức mẫu
     */
    List<News> findByUniqueIdLike(String pattern);
    
    /**
     * Đếm số lượng tin tức mẫu
     * @param pattern Mẫu uniqueId của dữ liệu mẫu (thường là "sample-%")
     * @return Số lượng tin tức mẫu
     */
    long countByUniqueIdLike(String pattern);
    
    /**
     * Xóa tất cả các tin tức mẫu
     * @param pattern Mẫu uniqueId của dữ liệu mẫu (thường là "sample-%")
     * @return Số lượng tin tức đã xóa
     */
    @Modifying
    @Query("DELETE FROM News n WHERE n.uniqueId LIKE :pattern")
    int deleteByUniqueIdLike(@Param("pattern") String pattern);
} 