package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findBySessionId(String sessionId);
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<ChatSession> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    boolean existsBySessionId(String sessionId);
} 