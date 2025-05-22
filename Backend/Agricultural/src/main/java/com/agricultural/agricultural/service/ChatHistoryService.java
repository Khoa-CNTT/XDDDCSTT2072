package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ai.request.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.request.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.response.MessageHistoryResponse;
import com.agricultural.agricultural.entity.ChatMessage;
import com.agricultural.agricultural.entity.ChatSession;

import java.util.List;


public interface ChatHistoryService {

    ChatSession saveMessages(String sessionId, String userId, String userMessage, String aiResponse, String source);


    ChatSession createSession(String userId, String model);


    MessageHistoryResponse getMessageHistory(MessageHistoryRequest request);


    List<ChatMessage> getSessionMessages(String sessionId);


    List<ChatBotRequest.MessageContext> getContextFromHistory(String sessionId, Integer limit);


    List<ChatSession> getChatSessionsByUserId(String userId);
} 