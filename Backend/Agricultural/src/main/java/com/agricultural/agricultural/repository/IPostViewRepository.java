package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.PostView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPostViewRepository extends JpaRepository<PostView, Integer> {
    
    /**
     * Tìm lượt xem của một người dùng đối với một bài viết
     */
    Optional<PostView> findByPostIdAndUserId(Integer postId, Integer userId);
    
    /**
     * Đếm số lượt xem của một bài viết
     */
    long countByPostId(Integer postId);
    
    /**
     * Đếm số lượt xem của nhiều bài viết
     */
    @Query("SELECT p.post.id, COUNT(p) FROM PostView p WHERE p.post.id IN :postIds GROUP BY p.post.id")
    List<Object[]> countByPostIdIn(@Param("postIds") List<Integer> postIds);
    
    /**
     * Đếm số lượt xem duy nhất (theo người dùng) của một bài viết
     */
    @Query("SELECT COUNT(DISTINCT p.user.id) FROM PostView p WHERE p.post.id = :postId")
    long countUniqueViewersByPostId(@Param("postId") Integer postId);

    /**
     * Kiểm tra xem người dùng đã xem bài viết chưa
     */
    boolean existsByPostIdAndUserId(Integer postId, Integer userId);
} 