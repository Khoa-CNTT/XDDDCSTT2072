package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
    private Integer id;
    private String userName;
    private String email;
    private String phone;
    private String role;
    private String token;
    private String message;

    public AuthResponse(String message) {
        this.message = message;
    }
}
