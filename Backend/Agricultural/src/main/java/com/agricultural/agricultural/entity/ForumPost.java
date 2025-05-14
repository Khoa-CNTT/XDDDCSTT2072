package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.PrivacyLevel;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UpdateTimestamp;

//import java.security.Timestamp;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@Table(name = "forum_posts")
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ForumPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user; // Liên kết với bảng users để lấy thông tin người dùng

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at")
    private Timestamp createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;
    
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;
    
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "privacy_level", nullable = false)
    private PrivacyLevel privacyLevel = PrivacyLevel.PUBLIC;
    
    @Column(name = "attachment_type")
    private String attachmentType;
    
    @Column(name = "attachment_url")
    private String attachmentUrl;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "feeling")
    private String feeling;
    
    @Column(name = "background_color")
    private String backgroundColor;
    
    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;
    
    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false;
    
    @Column(name = "edited_at")
    private Timestamp editedAt;
    
    @Column(name = "is_shared", nullable = false)
    private Boolean isShared = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_post_id")
    private ForumPost originalPost;
    
    @OneToMany(mappedBy = "originalPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ForumPost> sharedPosts = new ArrayList<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ForumPostImage> images = new ArrayList<>();
    
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "post_hashtags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    @JsonIgnore
    private Set<Hashtag> hashtags = new HashSet<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ForumReaction> reactions = new ArrayList<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ForumReply> replies = new ArrayList<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UserMention> mentions = new ArrayList<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PostView> views = new ArrayList<>();
    
    // Phương thức tiện ích để thêm ảnh
    public void addImage(ForumPostImage image) {
        images.add(image);
        image.setPost(this);
    }
    
    // Phương thức tiện ích để xóa ảnh
    public void removeImage(ForumPostImage image) {
        images.remove(image);
        image.setPost(null);
    }
    
    // Phương thức tiện ích để thêm hashtag
    public void addHashtag(Hashtag hashtag) {
        hashtags.add(hashtag);
        hashtag.getPosts().add(this);
        hashtag.incrementPostCount();
    }
    
    // Phương thức tiện ích để xóa hashtag
    public void removeHashtag(Hashtag hashtag) {
        hashtags.remove(hashtag);
        hashtag.getPosts().remove(this);
        hashtag.decrementPostCount();
    }
    
    // Phương thức tiện ích để tăng lượt xem
    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 1 : this.viewCount + 1);
    }
}
