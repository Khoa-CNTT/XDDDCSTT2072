package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ai.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.ChatRequest;
import com.agricultural.agricultural.dto.ai.ChatResponse;
import com.agricultural.agricultural.dto.ai.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryResponse;

public interface AiChatService {
    ChatResponse processChat(ChatRequest request);
    ChatResponse processChatBot(ChatBotRequest request);
    MessageHistoryResponse getMessageHistory(MessageHistoryRequest request);
} 