package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumPostImageDTO {
    private Integer id;
    private Integer postId;
    
    @NotBlank(message = "URL hình ảnh không được để trống")
    private String imageUrl;
    
    @Size(max = 255, message = "Alt text không được vượt quá 255 ký tự")
    private String altText;
    
    @Min(value = 0, message = "Thứ tự hiển thị không được âm")
    @Builder.Default
    private Integer displayOrder = 0;
    
    private LocalDateTime createdAt;
    
    // Phương thức lấy tên file từ URL
    public String getFileName() {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        int lastSlashIndex = imageUrl.lastIndexOf('/');
        if (lastSlashIndex < 0 || lastSlashIndex >= imageUrl.length() - 1) {
            return imageUrl;
        }
        
        return imageUrl.substring(lastSlashIndex + 1);
    }
} 