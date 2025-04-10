package com.agricultural.agricultural.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ForumReplyDTO {
    private Integer id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer postId;
    private Integer userId;
    private String userName;
    private String userImageUrl;
    private Integer parentId;
    private Integer likeCount;
    
    @Builder.Default
    private List<ForumReplyDTO> replies = new ArrayList<>();
} 