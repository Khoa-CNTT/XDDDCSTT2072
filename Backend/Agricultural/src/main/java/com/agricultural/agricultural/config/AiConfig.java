package com.agricultural.agricultural.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "ai.service")
@Data
public class AiConfig {
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
    
    @Bean(name = "aiRestTemplate")
    public RestTemplate aiRestTemplate() {
        return new RestTemplate();
    }
} 