package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_sessions")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatSession extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "is_active", nullable = false)
    private boolean active;
    
    @Column(name = "model", nullable = false)
    private String model; // gemini, openai, etc.
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "session_id", referencedColumnName = "session_id")
    private List<ChatMessage> messages = new ArrayList<>();
} 