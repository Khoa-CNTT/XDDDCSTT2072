package com.agricultural.agricultural.dto.response;

import com.agricultural.agricultural.dto.UserDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    @JsonProperty("message")
    private String message;

    @JsonProperty("token")
    private String token;
    
    @JsonProperty("refreshToken")
    private String refreshToken;
    
    @JsonProperty("tokenType")
    private String tokenType = "Bearer";
    
    @JsonProperty("expiresAt")
    private Instant expiresAt;

    @JsonProperty("user")
    private UserDTO user;
} 