package com.agricultural.agricultural.config;

import com.agricultural.agricultural.config.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketAuthenticationConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    List<String> authorization = accessor.getNativeHeader("Authorization");
                    
                    if (authorization != null && !authorization.isEmpty()) {
                        String bearerToken = authorization.get(0);
                        
                        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
                            String jwt = bearerToken.substring(7);
                            String username = jwtService.extractUsername(jwt);
                            
                            if (StringUtils.hasText(username) && SecurityContextHolder.getContext().getAuthentication() == null) {
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                
                                if (jwtService.isTokenValid(jwt, userDetails)) {
                                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                                    
                                    accessor.setUser(authToken);
                                }
                            }
                        }
                    }
                }
                return message;
            }
        });
    }
} 