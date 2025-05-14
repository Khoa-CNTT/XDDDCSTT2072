package com.agricultural.agricultural.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageHistoryResponse {
    private List<Map<String, String>> messages;
    private boolean success;
    private String error;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Message {
        private String content;
        private String role; // user hoặc assistant
        private LocalDateTime timestamp;
    }
} 