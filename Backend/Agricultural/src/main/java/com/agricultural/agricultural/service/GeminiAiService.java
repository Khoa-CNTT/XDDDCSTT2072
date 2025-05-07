package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ai.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.ChatRequest;
import com.agricultural.agricultural.dto.ai.ChatResponse;
import com.agricultural.agricultural.dto.ai.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryResponse;

/**
 * Service gọi API của Gemini
 */
public interface GeminiAiService {
    /**
     * Gửi yêu cầu chat đến Gemini API
     * @param request Thông tin yêu cầu chat
     * @return Phản hồi từ Gemini
     */
    ChatResponse generateContent(ChatRequest request);
    
    /**
     * Xử lý yêu cầu chatbot
     * @param request Thông tin yêu cầu chatbot
     * @return Phản hồi từ chatbot
     */
    ChatResponse processChatBot(ChatBotRequest request);
    
    /**
     * Lấy lịch sử tin nhắn
     * @param request Thông tin yêu cầu lịch sử tin nhắn
     * @return Lịch sử tin nhắn
     */
    MessageHistoryResponse getMessageHistory(MessageHistoryRequest request);
} 