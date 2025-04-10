package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IForumReplyRepository extends JpaRepository<ForumReply, Integer> {
    
    // Tìm tất cả bình luận gốc (không có parent) của một bài viết
    @Query("SELECT r FROM ForumReply r WHERE r.post.id = :postId AND r.parent IS NULL AND r.isDeleted = false ORDER BY r.createdAt DESC")
    List<ForumReply> findRootRepliesByPostId(@Param("postId") Integer postId);
    
    // Tìm tất cả bình luận gốc (không có parent) của một bài viết với phân trang
    @Query("SELECT r FROM ForumReply r WHERE r.post.id = :postId AND r.parent IS NULL AND r.isDeleted = false ORDER BY r.createdAt DESC")
    Page<ForumReply> findRootRepliesByPostId(@Param("postId") Integer postId, Pageable pageable);
    
    // Tìm tất cả bình luận con của một bình luận cha
    @Query("SELECT r FROM ForumReply r WHERE r.parent.id = :parentId AND r.isDeleted = false ORDER BY r.createdAt ASC")
    List<ForumReply> findRepliesByParentId(@Param("parentId") Integer parentId);
    
    // Tìm tất cả bình luận con của một bình luận cha với phân trang
    @Query("SELECT r FROM ForumReply r WHERE r.parent.id = :parentId AND r.isDeleted = false ORDER BY r.createdAt ASC")
    Page<ForumReply> findRepliesByParentId(@Param("parentId") Integer parentId, Pageable pageable);
    
    // Đếm số lượng bình luận gốc của một bài viết
    @Query("SELECT COUNT(r) FROM ForumReply r WHERE r.post.id = :postId AND r.parent IS NULL AND r.isDeleted = false")
    Long countRootRepliesByPostId(@Param("postId") Integer postId);
    
    // Đếm tổng số bình luận (cả gốc và con) của một bài viết
    @Query("SELECT COUNT(r) FROM ForumReply r WHERE r.post.id = :postId AND r.isDeleted = false")
    Long countAllRepliesByPostId(@Param("postId") Integer postId);
    
    // Tìm tất cả bình luận của một người dùng
    List<ForumReply> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Integer userId);
} 