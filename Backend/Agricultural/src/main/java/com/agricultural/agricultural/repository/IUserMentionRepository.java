package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.UserMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUserMentionRepository extends JpaRepository<UserMention, Integer> {
    
    /**
     * Tìm tất cả mentions trong một bài viết
     */
    List<UserMention> findAllByPostId(Integer postId);
    
    /**
     * Tìm tất cả mentions trong một bình luận
     */
    List<UserMention> findAllByReplyId(Integer replyId);
    
    /**
     * Tìm tất cả mentions của một người dùng
     */
    List<UserMention> findAllByMentionedUserId(Integer userId);
    
    /**
     * Xóa tất cả mentions trong một bài viết
     */
    void deleteAllByPostId(Integer postId);
    
    /**
     * Xóa tất cả mentions trong một bình luận
     */
    void deleteAllByReplyId(Integer replyId);
} 