package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumReplyDTO;
import com.agricultural.agricultural.dto.request.ForumReplyRequest;
import com.agricultural.agricultural.exception.PermissionDenyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IForumReplyService {
    
    List<ForumReplyDTO> getRootRepliesByPostId(Integer postId);

    @Query("SELECT r FROM ForumReply r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.user.role WHERE r.post.id = :postId AND r.parent IS NULL")
    Page<ForumReplyDTO> getRootRepliesByPostId(Integer postId, Pageable pageable);
    
    List<ForumReplyDTO> getRepliesByParentId(Integer parentId);
    
    Page<ForumReplyDTO> getRepliesByParentId(Integer parentId, Pageable pageable);
    
    ForumReplyDTO createReply(ForumReplyRequest request, Integer userId);
    
    ForumReplyDTO updateReply(Integer replyId, String content, Integer userId) throws PermissionDenyException;
    
    void deleteReply(Integer replyId, Integer userId) throws PermissionDenyException;
    
    ForumReplyDTO likeReply(Integer replyId, Integer userId);
    
    ForumReplyDTO unlikeReply(Integer replyId, Integer userId);
    
    Long countRootRepliesByPostId(Integer postId);
    
    Long countAllRepliesByPostId(Integer postId);
} 