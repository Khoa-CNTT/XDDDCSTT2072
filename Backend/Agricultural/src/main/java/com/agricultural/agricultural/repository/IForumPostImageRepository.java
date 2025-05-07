package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumPostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface IForumPostImageRepository extends JpaRepository<ForumPostImage, Integer> {
    
    // Tìm tất cả ảnh theo bài viết, sắp xếp theo thứ tự hiển thị
    List<ForumPostImage> findByPostIdOrderByDisplayOrderAsc(Integer postId);
    
    // Đếm số lượng ảnh của bài viết
    long countByPostId(Integer postId);
    
    // Xóa tất cả ảnh của bài viết
    @Transactional
    void deleteByPostId(Integer postId);
    
    // Tìm ảnh với thứ tự hiển thị lớn nhất
    @Query("SELECT MAX(p.displayOrder) FROM ForumPostImage p WHERE p.post.id = :postId")
    Integer findMaxDisplayOrderByPostId(@Param("postId") Integer postId);
} 