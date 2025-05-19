package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ai.request.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.request.ChatRequest;
import com.agricultural.agricultural.dto.ai.response.ChatResponse;
import com.agricultural.agricultural.dto.ai.request.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.response.MessageHistoryResponse;

public interface AiChatService {
    ChatResponse processChat(ChatRequest request);
    ChatResponse processChatBot(ChatBotRequest request);
    MessageHistoryResponse getMessageHistory(MessageHistoryRequest request);
} 