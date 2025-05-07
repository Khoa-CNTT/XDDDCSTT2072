package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.config.AiConfig;
import com.agricultural.agricultural.dto.ai.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.ChatRequest;
import com.agricultural.agricultural.dto.ai.ChatResponse;
import com.agricultural.agricultural.dto.ai.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryResponse;
import com.agricultural.agricultural.service.ChatHistoryService;
import com.agricultural.agricultural.service.GeminiAiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiAiServiceImpl implements GeminiAiService {

    private final AiConfig aiConfig;
    private final RestTemplate aiRestTemplate;
    private final KeywordValidatorService keywordValidatorService;
    private final ObjectMapper objectMapper;
    private final ChatHistoryService chatHistoryService;
    
    // Deprecated: Lưu trữ lịch sử chat tạm thời (trong memory) - sẽ bị loại bỏ trong tương lai
    @Deprecated
    private final Map<String, List<Map<String, String>>> chatHistory = new HashMap<>();

    public GeminiAiServiceImpl(
            AiConfig aiConfig,
            @Qualifier("aiRestTemplate") RestTemplate aiRestTemplate,
            KeywordValidatorService keywordValidatorService,
            ObjectMapper objectMapper,
            ChatHistoryService chatHistoryService) {
        this.aiConfig = aiConfig;
        this.aiRestTemplate = aiRestTemplate;
        this.keywordValidatorService = keywordValidatorService;
        this.objectMapper = objectMapper;
        this.chatHistoryService = chatHistoryService;
    }

    @Override
    public ChatResponse generateContent(ChatRequest request) {
        try {
            log.info("Sending request to Gemini API: {}", request.getMessage());
            
            // Lấy URL API từ cấu hình hoặc sử dụng giá trị mặc định nếu null
            String apiUrl;
            if (aiConfig.getGemini() != null && aiConfig.getGemini().getEndpoint() != null && aiConfig.getGemini().getEndpoint().getText() != null) {
                apiUrl = aiConfig.getGemini().getEndpoint().getText();
            } else if (aiConfig.getGemini() != null && aiConfig.getGemini().getApi() != null && aiConfig.getGemini().getApi().getUrl() != null) {
                apiUrl = aiConfig.getGemini().getApi().getUrl();
                log.warn("Endpoint text is null, using API URL instead: {}", apiUrl);
            } else {
                apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
                log.warn("No Gemini endpoint configured, using default URL: {}", apiUrl);
            }
            
            // Lấy API key từ cấu hình
            String apiKey;
            if (aiConfig.getGemini() != null && aiConfig.getGemini().getApi() != null && aiConfig.getGemini().getApi().getKey() != null) {
                apiKey = aiConfig.getGemini().getApi().getKey();
            } else {
                apiKey = "DEFAULT_API_KEY";
                log.error("No Gemini API key configured, using default (which will fail)");
            }
            
            // Thêm API key vào URL
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("key", apiKey);
            
            // Lấy danh sách từ khóa nông nghiệp
            String keywords = keywordValidatorService.getAgricultureKeywordsString();
            
            // Chuẩn bị nội dung gửi đến Gemini
            String promptTemplate = "Tôi sẽ hỏi bạn về các vấn đề liên quan đến nông nghiệp. " +
                    "Hãy trả lời câu hỏi của tôi CHỈ nếu nó liên quan đến các chủ đề sau: %s. " +
                    "Nếu câu hỏi KHÔNG liên quan đến các chủ đề trên, hãy từ chối trả lời và " +
                    "gợi ý tôi nên hỏi về các chủ đề nông nghiệp. Nếu câu hỏi có liên quan, " +
                    "hãy cung cấp câu trả lời chính xác và hữu ích nhất. Câu hỏi của tôi là: %s";
            
            String promptText = String.format(promptTemplate, keywords, request.getMessage());
            
            // Chuẩn bị request body theo định dạng của Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            
            parts.put("text", promptText);
            contents.put("parts", new Object[]{parts});
            requestBody.put("contents", new Object[]{contents});
            
            // Chuẩn bị headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Tạo HTTP Entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Gọi API Gemini
            ResponseEntity<String> responseEntity = aiRestTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                // Xử lý phản hồi từ Gemini
                ChatResponse response = parseGeminiResponse(responseEntity.getBody());
                
                // Lưu vào lịch sử chat
                saveToHistory(request.getUserId(), request.getMessage(), response.getMessage());
                
                return response;
            } else {
                log.error("Error calling Gemini API: {}", responseEntity.getStatusCode());
                return ChatResponse.builder()
                        .success(false)
                        .error("Error calling Gemini API: " + responseEntity.getStatusCode())
                        .build();
            }
        } catch (RestClientException e) {
            log.error("Rest client error when calling Gemini API", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Error connecting to Gemini API: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error when calling Gemini API", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Unexpected error: " + e.getMessage())
                    .build();
        }
    }
    
    @Override
    public ChatResponse processChatBot(ChatBotRequest request) {
        try {
            log.info("Processing chatbot request with Gemini: {}", request.getMessage());
            
            // Lấy URL API từ cấu hình hoặc sử dụng giá trị mặc định nếu null
            String apiUrl;
            if (aiConfig.getGemini() != null && aiConfig.getGemini().getEndpoint() != null && aiConfig.getGemini().getEndpoint().getText() != null) {
                apiUrl = aiConfig.getGemini().getEndpoint().getText();
            } else if (aiConfig.getGemini() != null && aiConfig.getGemini().getApi() != null && aiConfig.getGemini().getApi().getUrl() != null) {
                apiUrl = aiConfig.getGemini().getApi().getUrl();
                log.warn("Endpoint text is null, using API URL instead: {}", apiUrl);
            } else {
                apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
                log.warn("No Gemini endpoint configured, using default URL: {}", apiUrl);
            }
            
            // Lấy API key từ cấu hình
            String apiKey;
            if (aiConfig.getGemini() != null && aiConfig.getGemini().getApi() != null && aiConfig.getGemini().getApi().getKey() != null) {
                apiKey = aiConfig.getGemini().getApi().getKey();
            } else {
                apiKey = "DEFAULT_API_KEY";
                log.error("No Gemini API key configured, using default (which will fail)");
            }
            
            // Thêm API key vào URL
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("key", apiKey);
            
            // Lấy danh sách từ khóa nông nghiệp
            String keywords = keywordValidatorService.getAgricultureKeywordsString();
            
            // Chuẩn bị prompt với context
            StringBuilder contextStr = new StringBuilder();
            if (request.getContext() != null && !request.getContext().isEmpty()) {
                contextStr.append("Đây là lịch sử trò chuyện trước đó:\n");
                for (ChatBotRequest.MessageContext ctx : request.getContext()) {
                    String role = "user".equals(ctx.getRole()) ? "Người dùng" : "Trợ lý";
                    contextStr.append(role).append(": ").append(ctx.getContent()).append("\n");
                }
            } else if (request.getSessionId() != null && !request.getSessionId().isEmpty()) {
                // Nếu không có context nhưng có sessionId, lấy context từ lịch sử
                List<ChatBotRequest.MessageContext> historyContext = 
                        chatHistoryService.getContextFromHistory(request.getSessionId(), 10); // Lấy 10 tin nhắn gần nhất
                
                if (!historyContext.isEmpty()) {
                    contextStr.append("Đây là lịch sử trò chuyện trước đó:\n");
                    for (ChatBotRequest.MessageContext ctx : historyContext) {
                        String role = "user".equals(ctx.getRole()) ? "Người dùng" : "Trợ lý";
                        contextStr.append(role).append(": ").append(ctx.getContent()).append("\n");
                    }
                }
            }
            
            // Tạo prompt tổng hợp
            String promptTemplate = "Tôi sẽ hỏi bạn về các vấn đề liên quan đến nông nghiệp. " +
                    "Hãy trả lời câu hỏi của tôi CHỈ nếu nó liên quan đến các chủ đề sau: %s. " +
                    "Nếu câu hỏi KHÔNG liên quan đến các chủ đề trên, hãy từ chối trả lời và " +
                    "gợi ý tôi nên hỏi về các chủ đề nông nghiệp. Nếu câu hỏi có liên quan, " +
                    "hãy cung cấp câu trả lời chính xác và hữu ích nhất.\n\n" +
                    "%s\n" +
                    "Câu hỏi hiện tại của tôi là: %s";
            
            String promptText = String.format(promptTemplate, keywords, contextStr.toString(), request.getMessage());
            
            // Chuẩn bị request body theo định dạng của Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            
            parts.put("text", promptText);
            contents.put("parts", new Object[]{parts});
            requestBody.put("contents", new Object[]{contents});
            
            // Chuẩn bị headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Tạo HTTP Entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Gọi API Gemini
            ResponseEntity<String> responseEntity = aiRestTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                // Xử lý phản hồi từ Gemini
                ChatResponse response = parseGeminiResponse(responseEntity.getBody());
                
                // Lưu vào lịch sử chat
                saveToHistory(request.getUserId(), request.getMessage(), response.getMessage());
                
                return response;
            } else {
                log.error("Error calling Gemini API: {}", responseEntity.getStatusCode());
                return ChatResponse.builder()
                        .success(false)
                        .error("Error calling Gemini API: " + responseEntity.getStatusCode())
                        .build();
            }
        } catch (RestClientException e) {
            log.error("Rest client error when calling Gemini API", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Error connecting to Gemini API: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error when calling Gemini API", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Unexpected error: " + e.getMessage())
                    .build();
        }
    }
    
    @Override
    public MessageHistoryResponse getMessageHistory(MessageHistoryRequest request) {
        try {
            log.info("Getting message history for session: {}", request.getSessionId());
            
            // Đầu tiên thử lấy từ database thông qua ChatHistoryService
            MessageHistoryResponse dbResponse = chatHistoryService.getMessageHistory(request);
            
            // Nếu có dữ liệu từ DB thì trả về
            if (dbResponse.isSuccess() && dbResponse.getMessages() != null && !dbResponse.getMessages().isEmpty()) {
                log.info("Retrieved message history from database");
                return dbResponse;
            }
            
            // Fallback: sử dụng dữ liệu từ memory (compatibility)
            log.info("Falling back to in-memory message history");
            String sessionId = request.getSessionId() != null ? request.getSessionId() : request.getUserId();
            
            // Lấy lịch sử chat từ bộ nhớ
            List<Map<String, String>> history = chatHistory.getOrDefault(sessionId, new ArrayList<>());
            int limit = request.getLimit() != null ? request.getLimit() : 50;
            
            // Giới hạn số lượng tin nhắn
            if (history.size() > limit) {
                history = history.subList(history.size() - limit, history.size());
            }
            
            return MessageHistoryResponse.builder()
                    .success(true)
                    .messages(history)
                    .build();
            
        } catch (Exception e) {
            log.error("Error getting message history", e);
            return MessageHistoryResponse.builder()
                    .success(false)
                    .error("Error getting message history: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Phân tích phản hồi từ Gemini API
     * @param responseJson Chuỗi JSON phản hồi từ Gemini
     * @return Đối tượng ChatResponse
     */
    private ChatResponse parseGeminiResponse(String responseJson) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseJson);
            
            // Lấy nội dung phản hồi từ Gemini
            String content = "";
            if (rootNode.has("candidates") && rootNode.get("candidates").isArray() &&
                    rootNode.get("candidates").size() > 0) {
                JsonNode contentNode = rootNode.get("candidates").get(0).path("content");
                if (contentNode.has("parts") && contentNode.get("parts").isArray() &&
                        contentNode.get("parts").size() > 0) {
                    content = contentNode.get("parts").get(0).path("text").asText("");
                }
            }
            
            return ChatResponse.builder()
                    .message(content)
                    .source("gemini")
                    .success(true)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Error parsing Gemini response", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Error parsing Gemini response: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Lưu tin nhắn vào lịch sử chat
     * @param sessionId ID phiên
     * @param userMessage Tin nhắn từ người dùng
     * @param aiResponse Phản hồi từ AI
     */
    private void saveToHistory(String sessionId, String userMessage, String aiResponse) {
        try {
            if (sessionId == null) {
                sessionId = "anonymous_" + System.currentTimeMillis();
            }
            
            // Lưu vào DB thông qua ChatHistoryService
            chatHistoryService.saveMessages(sessionId, sessionId, userMessage, aiResponse, "gemini");
            
            // Đồng thời vẫn lưu vào memory cho compatibility
            List<Map<String, String>> history = chatHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());
            
            // Thêm tin nhắn người dùng
            Map<String, String> userEntry = new HashMap<>();
            userEntry.put("role", "user");
            userEntry.put("content", userMessage);
            userEntry.put("timestamp", LocalDateTime.now().toString());
            history.add(userEntry);
            
            // Thêm phản hồi AI
            Map<String, String> aiEntry = new HashMap<>();
            aiEntry.put("role", "assistant");
            aiEntry.put("content", aiResponse);
            aiEntry.put("timestamp", LocalDateTime.now().toString());
            history.add(aiEntry);
            
            // Giới hạn lịch sử lưu trữ
            if (history.size() > 100) {
                chatHistory.put(sessionId, history.subList(history.size() - 100, history.size()));
            }
        } catch (Exception e) {
            log.error("Error saving to chat history", e);
        }
    }
} 