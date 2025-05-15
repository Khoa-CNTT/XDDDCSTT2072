package com.agricultural.agricultural.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

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
    
    @NotBlank(message = "Nội dung trả lời không được để trống")
    @Size(min = 2, max = 1000, message = "Nội dung trả lời phải từ 2 đến 1000 ký tự")
    private String content;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @NotNull(message = "ID bài viết không được để trống")
    private Integer postId;
    
    @NotNull(message = "ID người dùng không được để trống")
    private Integer userId;
    
    private String userName;
    private String userImageUrl;
    private Integer parentId;
    private Integer likeCount;
    private Boolean isInappropriate;
    
    @Builder.Default
    private List<ForumReplyDTO> replies = new ArrayList<>();
} 