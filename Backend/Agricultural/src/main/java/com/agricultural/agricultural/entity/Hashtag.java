package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity lưu trữ thông tin hashtag trong forum
 */
@Entity
@Table(name = "hashtags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hashtag {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(name = "post_count")
    @Builder.Default
    private Integer postCount = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToMany(mappedBy = "hashtags")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private Set<ForumPost> posts = new HashSet<>();
    
    public void incrementPostCount() {
        this.postCount = (this.postCount == null ? 1 : this.postCount + 1);
    }
    
    public void decrementPostCount() {
        if (this.postCount != null && this.postCount > 0) {
            this.postCount--;
        }
    }
} 