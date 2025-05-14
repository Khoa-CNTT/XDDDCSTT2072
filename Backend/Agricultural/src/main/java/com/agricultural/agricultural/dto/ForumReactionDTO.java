package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO chứa thông tin về cảm xúc trong forum
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumReactionDTO {
    
    private Integer id;
    
    private Integer postId;
    
    private Integer replyId;
    
    private Integer userId;
    
    private String userName;
    
    private String userAvatar;
    
    private ReactionType reactionType;
    
    private String displayEmoji;
    
    private LocalDateTime createdAt;
} 