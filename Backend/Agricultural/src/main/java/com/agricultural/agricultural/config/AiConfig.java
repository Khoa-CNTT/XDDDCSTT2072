package com.agricultural.agricultural.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@ConfigurationProperties(prefix = "ai.service")
@Data
public class AiConfig {
    private String baseUrl;
    private String apiKey;
    private int timeout = 30000; // 30 seconds timeout
    private GeminiConfig gemini;
    
    @Data
    public static class GeminiConfig {
        private ApiConfig api;
        private Endpoint endpoint;
        
        @Data
        public static class ApiConfig {
            private String url;
            private String key;
        }
        
        @Data
        public static class Endpoint {
            private String text;
        }
    }
    
    @Bean
    public WebClient aiWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
    
    @Bean(name = "aiRestTemplate")
    public RestTemplate aiRestTemplate() {
        return new RestTemplate();
    }
} 