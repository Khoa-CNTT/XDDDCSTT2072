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
    
    @Query("SELECT r FROM ForumReply r WHERE r.post.id = :postId AND r.parent IS NULL AND r.isDeleted = false ORDER BY r.createdAt DESC")
    List<ForumReply> findRootRepliesByPostId(@Param("postId") Integer postId);
    
    @Query("SELECT r FROM ForumReply r WHERE r.post.id = :postId AND r.parent IS NULL AND r.isDeleted = false ORDER BY r.createdAt DESC")
    Page<ForumReply> findRootRepliesByPostId(@Param("postId") Integer postId, Pageable pageable);
    
    @Query("SELECT r FROM ForumReply r WHERE r.parent.id = :parentId AND r.isDeleted = false ORDER BY r.createdAt ASC")
    List<ForumReply> findRepliesByParentId(@Param("parentId") Integer parentId);
    
    @Query("SELECT r FROM ForumReply r WHERE r.parent.id = :parentId AND r.isDeleted = false ORDER BY r.createdAt ASC")
    Page<ForumReply> findRepliesByParentId(@Param("parentId") Integer parentId, Pageable pageable);
    
    @Query("SELECT COUNT(r) FROM ForumReply r WHERE r.post.id = :postId AND r.parent IS NULL AND r.isDeleted = false")
    Long countRootRepliesByPostId(@Param("postId") Integer postId);
    
    @Query("SELECT COUNT(r) FROM ForumReply r WHERE r.post.id = :postId AND r.isDeleted = false")
    Long countAllRepliesByPostId(@Param("postId") Integer postId);
    
    List<ForumReply> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Integer userId);
} 