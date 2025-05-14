package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho thông tin đề cập đến người dùng trong bài viết hoặc bình luận
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMentionDTO {
    
    private Integer id;
    
    private Integer postId;
    
    private Integer replyId;
    
    private Integer mentionedUserId;
    
    private String mentionedUserName;
    
    private String mentionedUserAvatar;
    
    private LocalDateTime createdAt;
} 