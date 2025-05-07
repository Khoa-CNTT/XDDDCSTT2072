package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsDTO {
    private Long id;
    private String title;
    private String summary;
    private String content;
    private String imageUrl;
    private String sourceUrl;
    private String sourceName;
    private LocalDateTime publishedDate;
    private String category;
    private String tags;
} 