package com.agricultural.agricultural.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequest {
    private String message;
    private String userId;
    private String domain = "agricultural"; // Mặc định là lĩnh vực nông nghiệp
} 