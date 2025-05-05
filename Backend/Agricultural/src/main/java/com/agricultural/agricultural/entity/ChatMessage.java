package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(name = "role", nullable = false)
    private String role; // user, assistant
    
    @Column(name = "source")
    private String source; // gemini, openai, etc.
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // Lưu thông tin bổ sung dưới dạng JSON
    
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
} 