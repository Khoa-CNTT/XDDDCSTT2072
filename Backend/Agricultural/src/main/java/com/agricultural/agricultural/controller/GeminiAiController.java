package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ai.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.ChatRequest;
import com.agricultural.agricultural.dto.ai.ChatResponse;
import com.agricultural.agricultural.dto.ai.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryResponse;
import com.agricultural.agricultural.entity.ChatSession;
import com.agricultural.agricultural.service.ChatHistoryService;
import com.agricultural.agricultural.service.GeminiAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/ai")
@RequiredArgsConstructor
@Slf4j
public class GeminiAiController {

    private final GeminiAiService geminiAiService;
    private final ChatHistoryService chatHistoryService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> generateContent(@RequestBody ChatRequest request) {
        log.info("Received Gemini chat request: {}", request.getMessage());
        ChatResponse response = geminiAiService.generateContent(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/chatbot")
    public ResponseEntity<ChatResponse> chatbot(@RequestBody ChatBotRequest request) {
        log.info("Received chatbot request: {}", request.getMessage());
        ChatResponse response = geminiAiService.processChatBot(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/message-history")
    public ResponseEntity<MessageHistoryResponse> getMessageHistory(@RequestBody MessageHistoryRequest request) {
        log.info("Received message history request for session: {}", request.getSessionId());
        MessageHistoryResponse response = geminiAiService.getMessageHistory(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sessions")
    public ResponseEntity<?> getChatSessions(@RequestParam(required = false) String userId) {
        log.info("Getting chat sessions for user: {}", userId);
        try {
            List<ChatSession> sessions;
            if (userId != null && !userId.isEmpty()) {
                sessions = chatHistoryService.getChatSessionsByUserId(userId);
            } else {
                return ResponseEntity.badRequest().body("UserId is required");
            }
            
            // Chuyển đổi dữ liệu thành DTO trước khi trả về
            List<Object> sessionDtos = sessions.stream()
                    .map(session -> {
                        return new Object() {
                            public final String sessionId = session.getSessionId();
                            public final String title = session.getTitle();
                            public final String model = session.getModel();
                            public final String createdAt = session.getCreatedAt().toString();
                            public final boolean active = session.isActive();
                        };
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(sessionDtos);
        } catch (Exception e) {
            log.error("Error getting chat sessions", e);
            return ResponseEntity.badRequest().body("Error getting chat sessions: " + e.getMessage());
        }
    }
} 