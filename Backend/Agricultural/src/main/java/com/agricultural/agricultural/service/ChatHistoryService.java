package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ai.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryResponse;
import com.agricultural.agricultural.entity.ChatMessage;
import com.agricultural.agricultural.entity.ChatSession;

import java.util.List;

/**
 * Service quản lý lịch sử chat
 */
public interface ChatHistoryService {
    /**
     * Lưu tin nhắn vào lịch sử chat
     * @param sessionId ID của phiên chat
     * @param userId ID của người dùng (có thể null)
     * @param userMessage Tin nhắn từ người dùng
     * @param aiResponse Phản hồi từ AI
     * @param source Nguồn AI (gemini, openai, etc)
     * @return Phiên chat đã được cập nhật
     */
    ChatSession saveMessages(String sessionId, String userId, String userMessage, String aiResponse, String source);
    
    /**
     * Khởi tạo phiên chat mới
     * @param userId ID của người dùng (có thể null)
     * @param model Model AI được sử dụng
     * @return Phiên chat mới
     */
    ChatSession createSession(String userId, String model);
    
    /**
     * Lấy lịch sử chat dựa trên ID phiên hoặc ID người dùng
     * @param request Thông tin yêu cầu lịch sử
     * @return Kết quả lịch sử tin nhắn
     */
    MessageHistoryResponse getMessageHistory(MessageHistoryRequest request);
    
    /**
     * Lấy danh sách tin nhắn của một phiên
     * @param sessionId ID của phiên
     * @return Danh sách tin nhắn
     */
    List<ChatMessage> getSessionMessages(String sessionId);
    
    /**
     * Chuyển đổi danh sách ChatBotRequest.MessageContext từ lịch sử chat
     * @param sessionId ID của phiên
     * @param limit Giới hạn số lượng tin nhắn (nếu null, lấy tất cả)
     * @return Danh sách MessageContext cho ChatBotRequest
     */
    List<ChatBotRequest.MessageContext> getContextFromHistory(String sessionId, Integer limit);
    
    /**
     * Lấy danh sách phiên chat của một người dùng
     * @param userId ID của người dùng
     * @return Danh sách phiên chat
     */
    List<ChatSession> getChatSessionsByUserId(String userId);
} 