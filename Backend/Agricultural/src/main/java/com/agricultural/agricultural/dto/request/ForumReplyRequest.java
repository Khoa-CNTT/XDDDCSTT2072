package com.agricultural.agricultural.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumReplyRequest {
    
    @NotBlank(message = "Nội dung bình luận không được để trống")
    @Size(min = 1, max = 2000, message = "Nội dung bình luận phải từ 1 đến 2000 ký tự")
    private String content;
    
    @NotNull(message = "ID bài viết không được để trống")
    private Integer postId;
    
    private Integer parentId; // Có thể null nếu là bình luận gốc
} 