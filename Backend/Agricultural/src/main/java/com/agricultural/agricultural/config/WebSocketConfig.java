package com.agricultural.agricultural.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple message broker to send messages to clients on destinations prefixed with /topic
        config.enableSimpleBroker("/topic", "/queue");
        
        // Set prefix for client-to-server messages
        config.setApplicationDestinationPrefixes("/app");
        
        // Set prefix for user-specific destinations
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoints where clients will connect
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // For development only, restrict in production
                .withSockJS(); // Enable SockJS fallback options
    }
} 