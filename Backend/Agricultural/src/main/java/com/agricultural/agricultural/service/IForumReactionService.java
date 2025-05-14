package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumReactionDTO;
import com.agricultural.agricultural.entity.enumeration.ReactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Service interface cho quản lý cảm xúc trong forum
 */
public interface IForumReactionService {
    
    /**
     * Thêm cảm xúc cho bài viết
     * @param postId ID bài viết
     * @param userId ID người dùng
     * @param reactionType Loại cảm xúc
     * @return ForumReactionDTO
     */
    ForumReactionDTO addPostReaction(Integer postId, Integer userId, ReactionType reactionType);
    
    /**
     * Thêm cảm xúc cho bình luận
     * @param replyId ID bình luận
     * @param userId ID người dùng
     * @param reactionType Loại cảm xúc
     * @return ForumReactionDTO
     */
    ForumReactionDTO addReplyReaction(Integer replyId, Integer userId, ReactionType reactionType);
    
    /**
     * Xóa cảm xúc khỏi bài viết
     * @param postId ID bài viết
     * @param userId ID người dùng
     * @param reactionType Loại cảm xúc
     * @return boolean
     */
    boolean removePostReaction(Integer postId, Integer userId, ReactionType reactionType);
    
    /**
     * Xóa cảm xúc khỏi bình luận
     * @param replyId ID bình luận
     * @param userId ID người dùng
     * @param reactionType Loại cảm xúc
     * @return boolean
     */
    boolean removeReplyReaction(Integer replyId, Integer userId, ReactionType reactionType);
    
    /**
     * Lấy tất cả cảm xúc của một bài viết
     * @param postId ID bài viết
     * @return Danh sách ForumReactionDTO
     */
    List<ForumReactionDTO> getReactionsByPostId(Integer postId);
    
    /**
     * Lấy tất cả cảm xúc của một bình luận
     * @param replyId ID bình luận
     * @return Danh sách ForumReactionDTO
     */
    List<ForumReactionDTO> getReactionsByReplyId(Integer replyId);
    
    /**
     * Đếm số lượng từng loại cảm xúc của một bài viết
     * @param postId ID bài viết
     * @return Map với key là tên cảm xúc, value là số lượng
     */
    Map<String, Integer> countReactionsByPostId(Integer postId);
    
    /**
     * Đếm số lượng từng loại cảm xúc của một bình luận
     * @param replyId ID bình luận
     * @return Map với key là tên cảm xúc, value là số lượng
     */
    Map<String, Integer> countReactionsByReplyId(Integer replyId);
    
    /**
     * Lấy cảm xúc của một người dùng đối với một bài viết
     * @param postId ID bài viết
     * @param userId ID người dùng
     * @return Danh sách cảm xúc của người dùng
     */
    List<ReactionType> getUserReactionsForPost(Integer postId, Integer userId);
    
    /**
     * Lấy cảm xúc của một người dùng đối với một bình luận
     * @param replyId ID bình luận
     * @param userId ID người dùng
     * @return Danh sách cảm xúc của người dùng
     */
    List<ReactionType> getUserReactionsForReply(Integer replyId, Integer userId);
    
    /**
     * Lấy danh sách người dùng đã thêm cảm xúc cho bài viết
     * @param postId ID bài viết
     * @param reactionType Loại cảm xúc
     * @param pageable Thông tin phân trang
     * @return Danh sách ForumReactionDTO
     */
    Page<ForumReactionDTO> getPostReactionUsers(Integer postId, ReactionType reactionType, Pageable pageable);
} 