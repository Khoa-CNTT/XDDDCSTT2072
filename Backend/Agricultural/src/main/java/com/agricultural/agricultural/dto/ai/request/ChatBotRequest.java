package com.agricultural.agricultural.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatBotRequest {
    private String message;
    private String userId;
    private String sessionId;
    private List<MessageContext> context; // Danh sách các tin nhắn trước đó
    private String domain = "agricultural"; // Mặc định là lĩnh vực nông nghiệp
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MessageContext {
        private String role;  // user, assistant
        private String content;
    }
} 