package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.config.AiConfig;
import com.agricultural.agricultural.dto.ai.ChatBotRequest;
import com.agricultural.agricultural.dto.ai.ChatRequest;
import com.agricultural.agricultural.dto.ai.ChatResponse;
import com.agricultural.agricultural.dto.ai.MessageHistoryRequest;
import com.agricultural.agricultural.dto.ai.MessageHistoryResponse;
import com.agricultural.agricultural.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class AiChatServiceImpl implements AiChatService {
    
    private final AiConfig aiConfig;
    private final WebClient aiWebClient;
    private final RestTemplate aiRestTemplate;
    private final KeywordValidatorService keywordValidatorService;
    
    public AiChatServiceImpl(
            AiConfig aiConfig, 
            WebClient aiWebClient, 
            @Qualifier("aiRestTemplate") RestTemplate aiRestTemplate, 
            KeywordValidatorService keywordValidatorService) {
        this.aiConfig = aiConfig;
        this.aiWebClient = aiWebClient;
        this.aiRestTemplate = aiRestTemplate;
        this.keywordValidatorService = keywordValidatorService;
    }
    
    @Override
    public ChatResponse processChat(ChatRequest request) {
        try {
            log.info("Processing chat request: {}", request.getMessage());
            
            // Chuẩn bị request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", request.getMessage());
            requestBody.put("user_id", request.getUserId());
            requestBody.put("domain", request.getDomain());
            
            // Thêm keywords từ KeywordValidatorService
            String keywords = keywordValidatorService.getAgricultureKeywordsString();
            if (keywords != null && !keywords.isEmpty()) {
                requestBody.put("domain_keywords", keywords);
                log.debug("Added domain keywords for domain {}", request.getDomain());
            }
            
            // Chuẩn bị headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (aiConfig.getApiKey() != null && !aiConfig.getApiKey().isEmpty()) {
                headers.set("Authorization", "Bearer " + aiConfig.getApiKey());
            }
            
            // Tạo HTTP Entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Gọi API bằng RestTemplate
            ResponseEntity<ChatResponse> responseEntity = aiRestTemplate.exchange(
                    aiConfig.getBaseUrl() + "/chat",
                    HttpMethod.POST,
                    requestEntity,
                    ChatResponse.class
            );
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                log.info("Successfully processed chat request");
                return responseEntity.getBody();
            } else {
                log.error("Error processing chat request: {}", responseEntity.getStatusCode());
                return ChatResponse.builder()
                        .success(false)
                        .error("AI service returned error: " + responseEntity.getStatusCode())
                        .build();
            }
        } catch (RestClientException e) {
            log.error("RestClient error processing chat request", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Error connecting to AI service: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error processing chat request", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ChatResponse processChatBot(ChatBotRequest request) {
        try {
            log.info("Processing chatbot request: {}", request.getMessage());
            
            // Chuẩn bị request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", request.getMessage());
            requestBody.put("user_id", request.getUserId());
            requestBody.put("context", request.getContext());
            requestBody.put("domain", request.getDomain());
            
            // Thêm keywords từ KeywordValidatorService
            String keywords = keywordValidatorService.getAgricultureKeywordsString();
            if (keywords != null && !keywords.isEmpty()) {
                requestBody.put("domain_keywords", keywords);
                log.debug("Added domain keywords for domain {}", request.getDomain());
            }
            
            // Chuẩn bị headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (aiConfig.getApiKey() != null && !aiConfig.getApiKey().isEmpty()) {
                headers.set("Authorization", "Bearer " + aiConfig.getApiKey());
            }
            
            // Tạo HTTP Entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Gọi API bằng RestTemplate
            ResponseEntity<ChatResponse> responseEntity = aiRestTemplate.exchange(
                    aiConfig.getBaseUrl() + "/chatbot",
                    HttpMethod.POST,
                    requestEntity,
                    ChatResponse.class
            );
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                log.info("Successfully processed chatbot request");
                return responseEntity.getBody();
            } else {
                log.error("Error processing chatbot request: {}", responseEntity.getStatusCode());
                return ChatResponse.builder()
                        .success(false)
                        .error("AI service returned error: " + responseEntity.getStatusCode())
                        .build();
            }
        } catch (RestClientException e) {
            log.error("RestClient error processing chatbot request", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Error connecting to AI service: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error processing chatbot request", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public MessageHistoryResponse getMessageHistory(MessageHistoryRequest request) {
        try {
            log.info("Getting message history for user: {}", request.getUserId());
            
            // Chuẩn bị parameters
            String url = aiConfig.getBaseUrl() + "/history?user_id=" + request.getUserId();
            if (request.getLimit() != null) {
                url += "&limit=" + request.getLimit();
            }
            
            // Chuẩn bị headers
            HttpHeaders headers = new HttpHeaders();
            if (aiConfig.getApiKey() != null && !aiConfig.getApiKey().isEmpty()) {
                headers.set("Authorization", "Bearer " + aiConfig.getApiKey());
            }
            
            // Tạo HTTP Entity
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);
            
            // Gọi API bằng RestTemplate
            ResponseEntity<MessageHistoryResponse> responseEntity = aiRestTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    MessageHistoryResponse.class
            );
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                log.info("Successfully retrieved message history");
                return responseEntity.getBody();
            } else {
                log.error("Error getting message history: {}", responseEntity.getStatusCode());
                return MessageHistoryResponse.builder()
                        .success(false)
                        .error("AI service returned error: " + responseEntity.getStatusCode())
                        .build();
            }
        } catch (RestClientException e) {
            log.error("RestClient error getting message history", e);
            return MessageHistoryResponse.builder()
                    .success(false)
                    .error("Error connecting to AI service: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error getting message history", e);
            return MessageHistoryResponse.builder()
                    .success(false)
                    .error("Unexpected error: " + e.getMessage())
                    .build();
        }
    }
    
    // Phương thức sử dụng WebClient (phương án dự phòng)
    private Mono<ChatResponse> processChatReactive(ChatRequest request) {
        log.info("Processing chat request with WebClient: {}", request.getMessage());
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("message", request.getMessage());
        requestBody.put("user_id", request.getUserId());
        requestBody.put("domain", request.getDomain());
        
        // Thêm keywords từ KeywordValidatorService
        String keywords = keywordValidatorService.getAgricultureKeywordsString();
        if (keywords != null && !keywords.isEmpty()) {
            requestBody.put("domain_keywords", keywords);
            log.debug("Added domain keywords for domain {}", request.getDomain());
        }
        
        return aiWebClient.post()
                .uri("/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> {
                    if (aiConfig.getApiKey() != null && !aiConfig.getApiKey().isEmpty()) {
                        headers.set("Authorization", "Bearer " + aiConfig.getApiKey());
                    }
                })
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .timeout(java.time.Duration.ofMillis(aiConfig.getTimeout()))
                .onErrorResume(TimeoutException.class, e -> {
                    log.error("Timeout when calling AI service", e);
                    return Mono.just(ChatResponse.builder()
                            .success(false)
                            .error("Timeout when calling AI service")
                            .build());
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("Error processing chat request with WebClient", e);
                    return Mono.just(ChatResponse.builder()
                            .success(false)
                            .error("Error: " + e.getMessage())
                            .build());
                });
    }
} 