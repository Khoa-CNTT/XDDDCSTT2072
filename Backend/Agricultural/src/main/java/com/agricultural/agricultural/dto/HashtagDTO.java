package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO chứa thông tin về hashtag trong forum
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HashtagDTO {
    
    private Integer id;
    
    private String name;
    
    private Integer postCount;
    
    private LocalDateTime createdAt;
    
    // Constructor với tên hashtag
    public HashtagDTO(String name) {
        this.name = name;
        this.postCount = 0;
    }
} 