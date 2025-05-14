package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Hashtag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IHashtagRepository extends JpaRepository<Hashtag, Integer> {
    
    /**
     * Tìm hashtag theo tên chính xác
     */
    Optional<Hashtag> findByName(String name);
    
    /**
     * Tìm hashtag theo một phần của tên
     */
    List<Hashtag> findByNameContainingIgnoreCase(String name);
    
    /**
     * Lấy danh sách hashtag phổ biến dựa trên số lượng bài viết
     */
    Page<Hashtag> findAllByOrderByPostCountDesc(Pageable pageable);
    
    /**
     * Tìm tất cả hashtag của một bài viết
     */
    @Query("SELECT h FROM Hashtag h JOIN h.posts p WHERE p.id = :postId")
    List<Hashtag> findAllByPostId(@Param("postId") Integer postId);
    
    /**
     * Tìm một hashtag cụ thể của một bài viết
     */
    @Query("SELECT h FROM Hashtag h JOIN h.posts p WHERE p.id = :postId AND h.id = :hashtagId")
    Optional<Hashtag> findByPostIdAndHashtagId(@Param("postId") Integer postId, @Param("hashtagId") Integer hashtagId);
} 