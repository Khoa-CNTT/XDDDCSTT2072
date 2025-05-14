package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId);
    List<ChatMessage> findByUserIdOrderByTimestampDesc(String userId);
    List<ChatMessage> findBySessionIdAndUserIdOrderByTimestampAsc(String sessionId, String userId);
    Page<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId, Pageable pageable);
    long countBySessionId(String sessionId);
} 