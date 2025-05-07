package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.ReactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ thông tin cảm xúc trong forum
 */
@Entity
@Table(name = "forum_reactions", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"post_id", "user_id", "reaction_type"}),
           @UniqueConstraint(columnNames = {"reply_id", "user_id", "reaction_type"})
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumReaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private ForumPost post;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_id")
    private ForumReply reply;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false)
    private ReactionType reactionType;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        if (post == null && reply == null) {
            throw new IllegalStateException("Phản ứng phải liên kết với bài viết hoặc bình luận");
        }
        
        if (post != null && reply != null) {
            throw new IllegalStateException("Phản ứng không thể liên kết với cả bài viết và bình luận");
        }
    }
} 