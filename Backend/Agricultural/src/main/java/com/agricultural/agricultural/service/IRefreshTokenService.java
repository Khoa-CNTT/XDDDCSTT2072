package com.agricultural.agricultural.service;

import com.agricultural.agricultural.entity.RefreshToken;
import com.agricultural.agricultural.exception.TokenRefreshException;

import java.util.Optional;

public interface IRefreshTokenService {
    
    RefreshToken createRefreshToken(Integer userId);
    
    Optional<RefreshToken> findByToken(String token);
    
    RefreshToken verifyExpiration(RefreshToken token) throws TokenRefreshException;
    
    void deleteByUserId(Integer userId);
} 