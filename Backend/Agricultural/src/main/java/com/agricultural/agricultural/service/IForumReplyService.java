package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumReplyDTO;
import com.agricultural.agricultural.dto.request.ForumReplyRequest;
import com.agricultural.agricultural.exception.PermissionDenyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IForumReplyService {
    
    // Lấy tất cả bình luận gốc của một bài viết
    List<ForumReplyDTO> getRootRepliesByPostId(Integer postId);

    // Lấy tất cả bình luận gốc của một bài viết với phân trang
    @Query("SELECT r FROM ForumReply r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.user.role WHERE r.post.id = :postId AND r.parent IS NULL")
    Page<ForumReplyDTO> getRootRepliesByPostId(Integer postId, Pageable pageable);
    
    // Lấy tất cả bình luận con của một bình luận cha
    List<ForumReplyDTO> getRepliesByParentId(Integer parentId);
    
    // Lấy tất cả bình luận con của một bình luận cha với phân trang
    Page<ForumReplyDTO> getRepliesByParentId(Integer parentId, Pageable pageable);
    
    // Tạo bình luận mới
    ForumReplyDTO createReply(ForumReplyRequest request, Integer userId);
    
    // Cập nhật bình luận
    ForumReplyDTO updateReply(Integer replyId, String content, Integer userId) throws PermissionDenyException;
    
    // Xóa bình luận (xóa mềm)
    void deleteReply(Integer replyId, Integer userId) throws PermissionDenyException;
    
    // Thích bình luận
    ForumReplyDTO likeReply(Integer replyId, Integer userId);
    
    // Bỏ thích bình luận
    ForumReplyDTO unlikeReply(Integer replyId, Integer userId);
    
    // Đếm số lượng bình luận gốc của một bài viết
    Long countRootRepliesByPostId(Integer postId);
    
    // Đếm tổng số bình luận (cả gốc và con) của một bài viết
    Long countAllRepliesByPostId(Integer postId);
} 