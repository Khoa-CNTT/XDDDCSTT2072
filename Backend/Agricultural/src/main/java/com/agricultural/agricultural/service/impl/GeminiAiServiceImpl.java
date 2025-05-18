package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.config.AiConfig;
import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.ai.request.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.request.ChatRequest;
import com.agricultural.agricultural.dto.ai.request.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.response.ChatResponse;
import com.agricultural.agricultural.dto.ai.response.MessageHistoryResponse;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.service.ChatHistoryService;
import com.agricultural.agricultural.service.GeminiAiService;
import com.agricultural.agricultural.service.impl.KeywordValidatorService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
@Slf4j
public class GeminiAiServiceImpl implements GeminiAiService {

    private final AiConfig aiConfig;
    private final RestTemplate aiRestTemplate;
    private final KeywordValidatorService keywordValidatorService;
    private final ObjectMapper objectMapper;
    private final ChatHistoryService chatHistoryService;
    private final IMarketPlaceRepository marketPlaceRepository;
    
    // Deprecated: Lưu trữ lịch sử chat tạm thời (trong memory) - sẽ bị loại bỏ trong tương lai
    @Deprecated
    private final Map<String, List<Map<String, String>>> chatHistory = new HashMap<>();

    public GeminiAiServiceImpl(
            AiConfig aiConfig,
            @Qualifier("aiRestTemplate") RestTemplate aiRestTemplate,
            KeywordValidatorService keywordValidatorService,
            ObjectMapper objectMapper,
            ChatHistoryService chatHistoryService,
            IMarketPlaceRepository marketPlaceRepository) {
        this.aiConfig = aiConfig;
        this.aiRestTemplate = aiRestTemplate;
        this.keywordValidatorService = keywordValidatorService;
        this.objectMapper = objectMapper;
        this.chatHistoryService = chatHistoryService;
        this.marketPlaceRepository = marketPlaceRepository;
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
            
            // Kiểm tra nếu người dùng đang hỏi về sản phẩm
            List<MarketPlaceDTO> relatedProducts = findRelatedProducts(request.getMessage());
            boolean isProductQuery = isProductRelatedQuery(request.getMessage());
            boolean isWebsiteInfoQuery = isWebsiteInfoQuery(request.getMessage());
            
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
            
            // Thêm thông tin về website
            String websiteInfo = "Thông tin về website AgroSphere:\n" +
                    "- Tên website: AgroSphere\n" +
                    "- Chủ sở hữu: Nhóm phát triển KLTN gồm Văn Dũng và các thành viên\n" +
                    "- Mục đích: Cung cấp nền tảng thông tin, mua bán và kết nối về nông nghiệp\n" +
                    "- Các tính năng chính:\n" +
                    "  + Cung cấp thông tin nông nghiệp và hướng dẫn kỹ thuật canh tác\n" +
                    "  + Marketplace: Mua bán sản phẩm nông nghiệp\n" +
                    "  + Dự báo thời tiết nông vụ\n" +
                    "  + Trợ lý AI hỗ trợ các vấn đề nông nghiệp\n" +
                    "  + Đăng ký gói thành viên để nhận thêm quyền lợi\n" +
                    "- Năm phát triển: 2023-2024\n" +
                    "- Công nghệ: Java Spring Boot, ReactJS, AI\n";

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
                    "Hãy trả lời câu hỏi của tôi CHỈ nếu nó liên quan đến các chủ đề sau: %s HOẶC nếu người dùng đang hỏi thông tin về website AgroSphere. " +
                    "Nếu câu hỏi KHÔNG liên quan đến các chủ đề trên hoặc không phải về website, hãy từ chối trả lời và " +
                    "gợi ý tôi nên hỏi về các chủ đề nông nghiệp hoặc về website. Nếu câu hỏi có liên quan, " +
                    "hãy cung cấp câu trả lời chính xác và hữu ích nhất.\n\n" +
                    "%s\n\n" +
                    "%s\n" +
                    "Câu hỏi hiện tại của tôi là: %s";
            
            // Nếu là câu hỏi về sản phẩm, thêm hướng dẫn đề cập đến việc hiển thị sản phẩm
            if (isProductQuery) {
                promptTemplate = "Tôi sẽ hỏi bạn về các vấn đề liên quan đến nông nghiệp. " +
                        "Hãy trả lời câu hỏi của tôi CHỈ nếu nó liên quan đến các chủ đề sau: %s HOẶC nếu người dùng đang hỏi thông tin về website AgroSphere. " +
                        "Nếu câu hỏi KHÔNG liên quan đến các chủ đề trên hoặc không phải về website, hãy từ chối trả lời và " +
                        "gợi ý tôi nên hỏi về các chủ đề nông nghiệp hoặc về website. Nếu câu hỏi có liên quan, " +
                        "hãy cung cấp câu trả lời chính xác và hữu ích nhất.\n\n" +
                        "Quan trọng: Tôi sẽ hiển thị một số sản phẩm liên quan với câu hỏi này dưới câu trả lời của bạn, " +
                        "vì vậy hãy đề cập trong câu trả lời của bạn rằng: 'Bạn có thể xem một số sản phẩm liên quan bên dưới.' ở cuối câu trả lời.\n\n" +
                        "%s\n\n" +
                        "%s\n" +
                        "Câu hỏi hiện tại của tôi là: %s";
            }
            
            String promptText;
            if (isWebsiteInfoQuery) {
                // Nếu là câu hỏi về website, đưa thông tin website vào prompt
                promptText = String.format(promptTemplate, keywords, websiteInfo, contextStr.toString(), request.getMessage());
            } else {
                promptText = String.format(promptTemplate, keywords, "", contextStr.toString(), request.getMessage());
            }
            
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
                
                // Thêm thông tin sản phẩm vào phản hồi nếu tìm thấy sản phẩm liên quan
                if (isProductQuery && !relatedProducts.isEmpty()) {
                    response.setProducts(relatedProducts);
                }
                
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

    /**
     * Kiểm tra xem câu hỏi có liên quan đến sản phẩm không
     * @param query Câu hỏi của người dùng
     * @return true nếu câu hỏi liên quan đến sản phẩm
     */
    private boolean isProductRelatedQuery(String query) {
        if (query == null || query.trim().isEmpty()) {
            return false;
        }
        
        String lowercaseQuery = query.toLowerCase();
        
        // Danh sách các từ khóa liên quan đến việc tìm kiếm sản phẩm
        List<String> productKeywords = List.of(
                "sản phẩm", "mua", "bán", "giá", "phân bón", "thuốc trừ sâu", "hạt giống", 
                "cây giống", "dụng cụ", "thiết bị", "máy móc", "nông cụ", "chất kích thích", 
                "phân lân", "phân đạm", "thuốc bảo vệ thực vật", "giá bao nhiêu", "bán ở đâu",
                "mua ở đâu"
        );
        
        // Kiểm tra xem có chứa bất kỳ từ khoá nào không
        for (String keyword : productKeywords) {
            if (lowercaseQuery.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Tìm kiếm sản phẩm liên quan dựa trên câu hỏi của người dùng
     * @param query Câu hỏi của người dùng
     * @return Danh sách các sản phẩm liên quan
     */
    private List<MarketPlaceDTO> findRelatedProducts(String query) {
        List<MarketPlaceDTO> results = new ArrayList<>();
        
        if (query == null || query.trim().isEmpty()) {
            return results;
        }
        
        try {
            // Trích xuất từ khóa từ câu hỏi
            List<String> keywords = extractProductKeywords(query);
            
            if (keywords.isEmpty()) {
                return results;
            }
            
            // Tăng số lượng sản phẩm tối đa lên 6
            final int MAX_PRODUCTS = 6;
            
            // Sử dụng Map để theo dõi điểm phù hợp của từng sản phẩm
            Map<Integer, Integer> productScores = new HashMap<>(); // id sản phẩm -> điểm
            Map<Integer, MarketPlaceDTO> productMap = new HashMap<>(); // id sản phẩm -> DTO
            
            // Tìm theo khớp chính xác với tên sản phẩm trước
            for (String keyword : keywords) {
                if (keyword.length() < 2) continue;
                
                // Tìm kiếm chính xác hơn với từ khóa dài - ưu tiên cao
                if (keyword.length() >= 4) {
                    Pageable exactMatchPageable = PageRequest.of(0, 3);
                    List<MarketPlace> exactMatches = marketPlaceRepository.findByProductNameContainingOrDescriptionContaining(
                            keyword, keyword, exactMatchPageable);
                    
                    for (MarketPlace product : exactMatches) {
                        // Tính điểm ưu tiên cao cho khớp chính xác
                        int score = productScores.getOrDefault(product.getId(), 0);
                        
                        // Nếu từ khóa xuất hiện trong tên sản phẩm
                        if (product.getProductName().toLowerCase().contains(keyword.toLowerCase())) {
                            score += 10; // Điểm cao hơn cho khớp tên
                        } else if (product.getDescription() != null && 
                                   product.getDescription().toLowerCase().contains(keyword.toLowerCase())) {
                            score += 5; // Điểm thấp hơn cho khớp mô tả
                        }
                        
                        // Lưu điểm và sản phẩm
                        productScores.put(product.getId(), score);
                        
                        if (!productMap.containsKey(product.getId())) {
                            MarketPlaceDTO dto = MarketPlaceDTO.builder()
                                    .id(product.getId())
                                    .productName(product.getProductName())
                                    .description(product.getDescription() != null ? 
                                            (product.getDescription().length() > 100 ? 
                                                    product.getDescription().substring(0, 100) + "..." : 
                                                    product.getDescription()) : "")
                                    .price(product.getPrice())
                                    .salePrice(product.getSalePrice())
                                    .imageUrl(product.getImageUrl())
                                    .build();
                            
                            productMap.put(product.getId(), dto);
                        }
                    }
                }
                
                // Tìm kiếm thêm sản phẩm
                Pageable pageable = PageRequest.of(0, 5); // Tăng số lượng cho mỗi từ khóa
                List<MarketPlace> products = marketPlaceRepository.findByProductNameContainingOrDescriptionContaining(
                        keyword, keyword, pageable);
                
                for (MarketPlace product : products) {
                    int score = productScores.getOrDefault(product.getId(), 0);
                    
                    // Điểm cộng thêm cho mỗi lần sản phẩm khớp với từ khóa khác
                    score += 1;
                    
                    productScores.put(product.getId(), score);
                    
                    if (!productMap.containsKey(product.getId())) {
                        MarketPlaceDTO dto = MarketPlaceDTO.builder()
                                .id(product.getId())
                                .productName(product.getProductName())
                                .description(product.getDescription() != null ? 
                                        (product.getDescription().length() > 100 ? 
                                                product.getDescription().substring(0, 100) + "..." : 
                                                product.getDescription()) : "")
                                .price(product.getPrice())
                                .salePrice(product.getSalePrice())
                                .imageUrl(product.getImageUrl())
                                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                                .build();
                        
                        productMap.put(product.getId(), dto);
                    }
                }
            }
            
            // Sắp xếp sản phẩm theo điểm số và giới hạn kết quả
            results = productScores.entrySet().stream()
                    .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                    .limit(MAX_PRODUCTS)
                    .map(entry -> productMap.get(entry.getKey()))
                    .collect(Collectors.toList());
            
            // Log thông tin về số lượng sản phẩm tìm thấy
            log.info("Tìm thấy {} sản phẩm liên quan cho truy vấn: {}", results.size(), query);
            
        } catch (Exception e) {
            log.error("Lỗi khi tìm kiếm sản phẩm liên quan: {}", e.getMessage(), e);
        }
        
        return results;
    }
    
    /**
     * Trích xuất các từ khóa liên quan đến sản phẩm từ câu hỏi
     * @param query Câu hỏi của người dùng
     * @return Danh sách các từ khóa
     */
    private List<String> extractProductKeywords(String query) {
        Set<String> keywordSet = new HashSet<>(); // Sử dụng Set để tránh trùng lặp từ khóa
        
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // Danh sách từ dừng - các từ không mang nhiều ý nghĩa khi tìm kiếm
        Set<String> stopwords = new HashSet<>(List.of(
                "là", "và", "hay", "hoặc", "trong", "ngoài", "với", "từ", "thì", 
                "có", "không", "của", "cho", "được", "bởi", "về", "tôi", "các", "những", 
                "mà", "để", "ở", "tại", "đó", "này", "khi", "đến", "như", "vì",
                "ai", "nào", "đâu", "gì", "sao", "vậy", "nhé", "à", "ạ", "ừ", "uh",
                "cần", "muốn", "hỏi", "xin", "vui lòng", "giúp", "giúp đỡ", "thông tin"
        ));
        
        // Loại bỏ dấu câu và ký tự đặc biệt
        String cleanQuery = query.toLowerCase()
                .replaceAll("[.,;:!?()\\[\\]{}'\"]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        
        String[] words = cleanQuery.split("\\s+");
        
        // Từ khóa liên quan đến sản phẩm nông nghiệp - giữ lại trong kết quả
        Set<String> productRelatedTerms = new HashSet<>(List.of(
                "phân bón", "thuốc trừ sâu", "hạt giống", "cây giống", "dụng cụ", 
                "thiết bị", "máy móc", "nông cụ", "chất kích thích", "phân lân", 
                "phân đạm", "thuốc bảo vệ thực vật", "giá bao nhiêu", "giá", "phân",
                "thuốc", "hạt", "cây", "máy", "dụng cụ", "thiết bị", "lúa", "ngô", 
                "khoai", "sắn", "rau", "củ", "quả", "trái"
        ));
        
        // Trích xuất từ đơn có ý nghĩa
        for (String word : words) {
            if (word.length() > 2 && !stopwords.contains(word)) {
                // Ưu tiên các từ liên quan đến sản phẩm
                if (productRelatedTerms.contains(word)) {
                    keywordSet.add(word);
                } else {
                    keywordSet.add(word);
                }
            }
        }
        
        // Trích xuất cụm từ 2-3 từ có ý nghĩa
        for (int i = 0; i < words.length - 1; i++) {
            if (words[i].length() > 1) {
                // Cụm 2 từ
                String phrase2 = words[i] + " " + words[i+1];
                if (productRelatedTerms.contains(phrase2) || !containsStopWord(phrase2, stopwords)) {
                    keywordSet.add(phrase2);
                }
                
                // Cụm 3 từ
                if (i < words.length - 2) {
                    String phrase3 = words[i] + " " + words[i+1] + " " + words[i+2];
                    if (productRelatedTerms.contains(phrase3) || !containsStopWord(phrase3, stopwords)) {
                        keywordSet.add(phrase3);
                    }
                }
            }
        }
        
        // Trích xuất từ khóa đặc biệt từ câu hỏi
        extractSpecialKeywords(cleanQuery, keywordSet);
        
        // Log từ khóa đã trích xuất
        log.debug("Các từ khóa trích xuất từ câu hỏi '{}': {}", query, keywordSet);
        
        return new ArrayList<>(keywordSet);
    }
    
    /**
     * Kiểm tra xem cụm từ có chứa từ dừng không
     * @param phrase Cụm từ cần kiểm tra
     * @param stopwords Danh sách từ dừng
     * @return true nếu cụm từ chứa từ dừng
     */
    private boolean containsStopWord(String phrase, Set<String> stopwords) {
        for (String stopword : stopwords) {
            if (phrase.equals(stopword) || 
                phrase.startsWith(stopword + " ") || 
                phrase.endsWith(" " + stopword) || 
                phrase.contains(" " + stopword + " ")) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Trích xuất các từ khóa đặc biệt từ câu hỏi
     * @param query Câu hỏi đã được làm sạch
     * @param keywordSet Tập hợp từ khóa
     */
    private void extractSpecialKeywords(String query, Set<String> keywordSet) {
        // Danh sách các biểu thức chính quy để trích xuất từ khóa đặc biệt
        Map<Pattern, Function<Matcher, String>> specialPatterns = new HashMap<>();
        
        // Mẫu trích xuất tên cây trồng/vật nuôi
        specialPatterns.put(
            Pattern.compile("(?:cây|trồng|hạt giống|giống|cây giống)\\s+(\\w+(?:\\s+\\w+){0,2})"),
            matcher -> matcher.group(1)
        );
        
        // Mẫu trích xuất tên loại phân bón
        specialPatterns.put(
            Pattern.compile("(?:phân bón|phân|bón)\\s+(\\w+(?:\\s+\\w+){0,2})"),
            matcher -> matcher.group(1)
        );
        
        // Mẫu trích xuất tên thuốc hoặc loại thuốc
        specialPatterns.put(
            Pattern.compile("(?:thuốc|thuốc trừ sâu|thuốc bảo vệ)\\s+(\\w+(?:\\s+\\w+){0,2})"),
            matcher -> matcher.group(1)
        );
        
        // Mẫu trích xuất tên dụng cụ
        specialPatterns.put(
            Pattern.compile("(?:dụng cụ|thiết bị|máy|máy móc)\\s+(\\w+(?:\\s+\\w+){0,2})"),
            matcher -> matcher.group(1)
        );
        
        // Áp dụng các mẫu trích xuất
        for (Map.Entry<Pattern, Function<Matcher, String>> entry : specialPatterns.entrySet()) {
            Matcher matcher = entry.getKey().matcher(query);
            while (matcher.find()) {
                String keyword = entry.getValue().apply(matcher);
                if (keyword != null && keyword.length() > 2) {
                    keywordSet.add(keyword);
                }
            }
        }
    }

    /**
     * Kiểm tra xem câu hỏi có liên quan đến thông tin website không
     * @param query Câu hỏi của người dùng
     * @return true nếu câu hỏi liên quan đến thông tin website
     */
    private boolean isWebsiteInfoQuery(String query) {
        if (query == null || query.trim().isEmpty()) {
            return false;
        }
        
        String lowercaseQuery = query.toLowerCase();
        
        // Danh sách các từ khóa liên quan đến website
        List<String> websiteKeywords = List.of(
                "website", "trang web", "agrosphere", "agro sphere", "cửa hàng", "platform", "nền tảng",
                "ai tạo ra", "ai phát triển", "ai là chủ", "công ty", "đội ngũ", "team", "nhóm phát triển",
                "chủ sở hữu", "tính năng", "chức năng", "dịch vụ", "giới thiệu", "về chúng tôi", 
                "about us", "liên hệ", "contact", "thông tin", "info"
        );
        
        // Kiểm tra xem có chứa bất kỳ từ khoá nào không
        for (String keyword : websiteKeywords) {
            if (lowercaseQuery.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }
} 