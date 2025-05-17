package com.agricultural.agricultural.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageHistoryRequest {
    private String userId;
    private String sessionId;
    private Integer limit;
} 