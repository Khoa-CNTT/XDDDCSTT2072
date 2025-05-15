package com.agricultural.agricultural.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "forum_replies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumReply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    String content;
    
    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
    
    // Liên kết với bài viết
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "post_id")
    ForumPost post;
    
    // Liên kết với người dùng đã đăng bình luận
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    
    // Bình luận cha (null nếu là bình luận gốc)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    ForumReply parent;
    
    // Danh sách các bình luận con
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonIgnore
    List<ForumReply> replies = new ArrayList<>();
    
    // Số lượt thích
    @Column(name = "like_count", nullable = false)
    @Builder.Default
    Integer likeCount = 0;
    
    // Cờ đánh dấu đã bị xóa mềm
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    Boolean isDeleted = false;
    
    // Cờ đánh dấu bình luận không phù hợp (tục tĩu, vi phạm)
    @Column(name = "is_inappropriate", nullable = false)
    @Builder.Default
    Boolean isInappropriate = false;
    
    // Phương thức tiện ích để thêm reply con
    public void addReply(ForumReply reply) {
        if (replies == null) {
            replies = new ArrayList<>();
        }
        replies.add(reply);
        reply.setParent(this);
    }
    
    // Phương thức tiện ích để xóa reply con
    public void removeReply(ForumReply reply) {
        replies.remove(reply);
        reply.setParent(null);
    }
    
    // Phương thức tăng số lượt thích
    public void incrementLikes() {
        if (likeCount == null) {
            likeCount = 0;
        }
        likeCount++;
    }
    
    // Phương thức giảm số lượt thích
    public void decrementLikes() {
        if (likeCount == null || likeCount <= 0) {
            likeCount = 0;
            return;
        }
        likeCount--;
    }
} 