package com.agricultural.agricultural.components;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        Object user = headerAccessor.getUser();
        if (user instanceof UsernamePasswordAuthenticationToken) {
            String username = ((UsernamePasswordAuthenticationToken) user).getName();
            log.info("User connected: {}", username);
        } else {
            log.info("Anonymous user connected");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        Object user = headerAccessor.getUser();
        if (user instanceof UsernamePasswordAuthenticationToken) {
            String username = ((UsernamePasswordAuthenticationToken) user).getName();
            log.info("User disconnected: {}", username);
        } else {
            log.info("Anonymous user disconnected");
        }
    }
} 