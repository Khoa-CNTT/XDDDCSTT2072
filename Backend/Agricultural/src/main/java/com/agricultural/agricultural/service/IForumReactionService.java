package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumReactionDTO;
import com.agricultural.agricultural.entity.enumeration.ReactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;


public interface IForumReactionService {
    

    ForumReactionDTO addPostReaction(Integer postId, Integer userId, ReactionType reactionType);
    

    ForumReactionDTO addReplyReaction(Integer replyId, Integer userId, ReactionType reactionType);
    

    boolean removePostReaction(Integer postId, Integer userId, ReactionType reactionType);
    

    boolean removeReplyReaction(Integer replyId, Integer userId, ReactionType reactionType);
    

    List<ForumReactionDTO> getReactionsByPostId(Integer postId);
    

    List<ForumReactionDTO> getReactionsByReplyId(Integer replyId);
    

    Map<String, Integer> countReactionsByPostId(Integer postId);
    

    Map<String, Integer> countReactionsByReplyId(Integer replyId);
    

    List<ReactionType> getUserReactionsForPost(Integer postId, Integer userId);
    

    List<ReactionType> getUserReactionsForReply(Integer replyId, Integer userId);
    

    Page<ForumReactionDTO> getPostReactionUsers(Integer postId, ReactionType reactionType, Pageable pageable);
} 