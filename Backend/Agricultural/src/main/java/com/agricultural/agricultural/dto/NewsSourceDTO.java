package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsSourceDTO {
    private Long id;
    private String name;
    private String url;
    private String articleSelector;
    private String titleSelector;
    private String summarySelector;
    private String contentSelector;
    private String imageSelector;
    private String dateSelector;
    private String dateFormat;
    private String category;
    private Boolean active;
} 