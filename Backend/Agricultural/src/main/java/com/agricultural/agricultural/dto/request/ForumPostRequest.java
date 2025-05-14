package com.agricultural.agricultural.dto.request;

import com.agricultural.agricultural.entity.enumeration.PrivacyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO cho việc tạo bài viết forum
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumPostRequest {
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề phải từ 5 đến 200 ký tự")
    private String title;
    
    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 10, max = 5000, message = "Nội dung phải từ 10 đến 5000 ký tự")
    private String content;
    
    private PrivacyLevel privacyLevel = PrivacyLevel.PUBLIC;
    
    private String location;
    
    private String feeling;
    
    private String backgroundColor;
    
    private String attachmentType;
    
    private String attachmentUrl;
    
    private List<String> hashtags;
    
    private List<Integer> mentionedUserIds;
} 