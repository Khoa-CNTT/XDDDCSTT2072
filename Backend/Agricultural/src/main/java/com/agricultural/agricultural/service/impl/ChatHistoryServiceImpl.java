package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ai.request.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.request.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.response.MessageHistoryResponse;
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
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseGet(() -> createSession(userId, source));

        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(session.getSessionId())
                .userId(userId)
                .content(userMessage)
                .role("user")
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage aiMsg = ChatMessage.builder()
                .sessionId(session.getSessionId())
                .userId(userId)
                .content(aiResponse)
                .role("assistant")
                .source(source)
                .timestamp(LocalDateTime.now().plusSeconds(1)) // Đảm bảo tin nhắn AI đến sau
                .build();

        chatMessageRepository.save(userMsg);
        chatMessageRepository.save(aiMsg);

        if (session.getTitle() == null || session.getTitle().isEmpty()) {
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
                messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
            } else if (userId != null && !userId.isEmpty()) {
                messages = chatMessageRepository.findByUserIdOrderByTimestampDesc(userId);
                if (messages.size() > limit) {
                    messages = messages.subList(0, limit);
                }
            } else {
                return MessageHistoryResponse.builder()
                        .success(false)
                        .error("Thiếu thông tin sessionId hoặc userId")
                        .build();
            }

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

        if (limit != null && limit > 0 && messages.size() > limit) {
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
            throw new IllegalArgumentException("UserId không duoc để trống");
        }
        return chatSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
} 