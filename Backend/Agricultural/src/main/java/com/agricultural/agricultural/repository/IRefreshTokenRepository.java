package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.RefreshToken;
import com.agricultural.agricultural.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IRefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByUser(User user);
    
    void deleteByUser(User user);
} 