package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumReaction;
import com.agricultural.agricultural.entity.enumeration.ReactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IForumReactionRepository extends JpaRepository<ForumReaction, Integer> {
    
    /**
     * Tìm reaction theo bài viết, người dùng và loại reaction
     */
    Optional<ForumReaction> findByPostIdAndUserIdAndReactionType(Integer postId, Integer userId, ReactionType reactionType);
    
    /**
     * Tìm reaction theo bình luận, người dùng và loại reaction
     */
    Optional<ForumReaction> findByReplyIdAndUserIdAndReactionType(Integer replyId, Integer userId, ReactionType reactionType);
    
    /**
     * Lấy tất cả reaction của một bài viết
     */
    List<ForumReaction> findAllByPostId(Integer postId);
    
    /**
     * Lấy tất cả reaction của một bình luận
     */
    List<ForumReaction> findAllByReplyId(Integer replyId);
    
    /**
     * Lấy tất cả reaction của một bài viết theo loại
     */
    List<ForumReaction> findAllByPostIdAndReactionType(Integer postId, ReactionType reactionType);
    
    /**
     * Lấy tất cả reaction của một bình luận theo loại
     */
    List<ForumReaction> findAllByReplyIdAndReactionType(Integer replyId, ReactionType reactionType);
    
    /**
     * Đếm số lượng reaction của một bài viết theo loại
     */
    @Query("SELECT r.reactionType, COUNT(r) FROM ForumReaction r WHERE r.post.id = :postId GROUP BY r.reactionType")
    List<Object[]> countReactionsByPostIdGroupByType(@Param("postId") Integer postId);
    
    /**
     * Đếm số lượng reaction của một bình luận theo loại
     */
    @Query("SELECT r.reactionType, COUNT(r) FROM ForumReaction r WHERE r.reply.id = :replyId GROUP BY r.reactionType")
    List<Object[]> countReactionsByReplyIdGroupByType(@Param("replyId") Integer replyId);
    
    /**
     * Lấy tất cả reaction của một người dùng đối với một bài viết
     */
    List<ForumReaction> findAllByPostIdAndUserId(Integer postId, Integer userId);
    
    /**
     * Lấy tất cả reaction của một người dùng đối với một bình luận
     */
    List<ForumReaction> findAllByReplyIdAndUserId(Integer replyId, Integer userId);
    
    /**
     * Lấy danh sách người dùng đã thêm reaction cho một bài viết theo loại
     */
    @Query("SELECT r FROM ForumReaction r JOIN FETCH r.user WHERE r.post.id = :postId AND r.reactionType = :reactionType")
    Page<ForumReaction> findAllByPostIdAndReactionTypeWithUser(
            @Param("postId") Integer postId, 
            @Param("reactionType") ReactionType reactionType, 
            Pageable pageable);
} 