package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ thông tin đề cập đến người dùng (mention) trong bài viết hoặc bình luận
 */
@Entity
@Table(name = "post_mentions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMention {
    
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
    @JoinColumn(name = "mentioned_user_id", nullable = false)
    private User mentionedUser;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        if (post == null && reply == null) {
            throw new IllegalStateException("Đề cập phải liên kết với bài viết hoặc bình luận");
        }
        
        if (post != null && reply != null) {
            throw new IllegalStateException("Đề cập không thể liên kết với cả bài viết và bình luận");
        }
    }
} 