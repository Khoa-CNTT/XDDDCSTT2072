package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ai.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryResponse;
import com.agricultural.agricultural.entity.ChatMessage;
import com.agricultural.agricultural.entity.ChatSession;
import com.agricultural.agricultural.repository.ChatMessageRepository;
import com.agricultural.agricultural.repository.ChatSessionRepository;
import com.agricultural.agricultural.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatHistoryServiceImpl implements ChatHistoryService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;

    @Override
    @Transactional
    public ChatSession saveMessages(String sessionId, String userId, String userMessage, String aiResponse, String source) {
        // Tìm session hoặc tạo mới nếu không tồn tại
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseGet(() -> createSession(userId, source));
        
        // Tạo tin nhắn người dùng
        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(session.getSessionId())
                .userId(userId)
                .content(userMessage)
                .role("user")
                .timestamp(LocalDateTime.now())
                .build();
        
        // Tạo tin nhắn AI
        ChatMessage aiMsg = ChatMessage.builder()
                .sessionId(session.getSessionId())
                .userId(userId)
                .content(aiResponse)
                .role("assistant")
                .source(source)
                .timestamp(LocalDateTime.now().plusSeconds(1)) // Đảm bảo tin nhắn AI đến sau
                .build();
        
        // Lưu tin nhắn
        chatMessageRepository.save(userMsg);
        chatMessageRepository.save(aiMsg);
        
        // Cập nhật tiêu đề phiên chat nếu chưa có
        if (session.getTitle() == null || session.getTitle().isEmpty()) {
            // Lấy 50 ký tự đầu tiên của tin nhắn người dùng làm tiêu đề
            String title = userMessage;
            if (title.length() > 50) {
                title = title.substring(0, 47) + "...";
            }
            session.setTitle(title);
            chatSessionRepository.save(session);
        }
        
        return session;
    }

    @Override
    @Transactional
    public ChatSession createSession(String userId, String model) {
        // Tạo ID ngẫu nhiên cho phiên chat
        String sessionId = UUID.randomUUID().toString();
        
        ChatSession session = ChatSession.builder()
                .sessionId(sessionId)
                .userId(userId)
                .active(true)
                .model(model)
                .build();
        
        return chatSessionRepository.save(session);
    }

    @Override
    public MessageHistoryResponse getMessageHistory(MessageHistoryRequest request) {
        try {
            String sessionId = request.getSessionId();
            String userId = request.getUserId();
            int limit = request.getLimit() != null ? request.getLimit() : 50;
            
            List<ChatMessage> messages;
            if (sessionId != null && !sessionId.isEmpty()) {
                // Nếu có sessionId, lấy tin nhắn theo phiên
                messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
            } else if (userId != null && !userId.isEmpty()) {
                // Nếu có userId, lấy tin nhắn theo người dùng
                messages = chatMessageRepository.findByUserIdOrderByTimestampDesc(userId);
                // Giới hạn số lượng tin nhắn
                if (messages.size() > limit) {
                    messages = messages.subList(0, limit);
                }
            } else {
                // Không có thông tin để lấy lịch sử
                return MessageHistoryResponse.builder()
                        .success(false)
                        .error("Thiếu thông tin sessionId hoặc userId")
                        .build();
            }
            
            // Chuyển đổi thành định dạng cần thiết cho response
            List<Map<String, String>> formattedMessages = messages.stream()
                    .map(message -> {
                        Map<String, String> msgMap = new HashMap<>();
                        msgMap.put("role", message.getRole());
                        msgMap.put("content", message.getContent());
                        msgMap.put("timestamp", message.getTimestamp().toString());
                        if (message.getSource() != null) {
                            msgMap.put("source", message.getSource());
                        }
                        return msgMap;
                    })
                    .collect(Collectors.toList());
            
            return MessageHistoryResponse.builder()
                    .success(true)
                    .messages(formattedMessages)
                    .build();
            
        } catch (Exception e) {
            log.error("Error getting message history", e);
            return MessageHistoryResponse.builder()
                    .success(false)
                    .error("Lỗi khi lấy lịch sử tin nhắn: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public List<ChatMessage> getSessionMessages(String sessionId) {
        return chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    @Override
    public List<ChatBotRequest.MessageContext> getContextFromHistory(String sessionId, Integer limit) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        
        // Giới hạn số lượng tin nhắn nếu cần
        if (limit != null && limit > 0 && messages.size() > limit) {
            // Lấy tin nhắn mới nhất theo limit
            messages = messages.subList(messages.size() - limit, messages.size());
        }
        
        // Chuyển đổi sang MessageContext
        return messages.stream()
                .map(message -> ChatBotRequest.MessageContext.builder()
                        .role(message.getRole())
                        .content(message.getContent())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatSession> getChatSessionsByUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("UserId cannot be null or empty");
        }
        return chatSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
} 