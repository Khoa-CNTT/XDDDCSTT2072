package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ai.request.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.request.ChatRequest;
import com.agricultural.agricultural.dto.ai.response.ChatResponse;
import com.agricultural.agricultural.dto.ai.request.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.response.MessageHistoryResponse;

/**
 * Service gọi API của Gemini
 */
public interface GeminiAiService {

    ChatResponse generateContent(ChatRequest request);

    ChatResponse processChatBot(ChatBotRequest request);

    MessageHistoryResponse getMessageHistory(MessageHistoryRequest request);
} 