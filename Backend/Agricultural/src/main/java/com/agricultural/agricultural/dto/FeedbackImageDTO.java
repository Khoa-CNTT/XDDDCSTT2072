package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackImageDTO {
    
    private Integer id;
    
    private Integer feedbackId;
    
    private String imageUrl;
    
    private Integer displayOrder;
} 