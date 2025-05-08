package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.PrivacyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ForumPostDTO {
    private int id;
    
    @NotNull(message = "ID người dùng không được để trống")
    private int userId;  // Liên kết với người dùng tạo bài viết
    
    private String userName; // Tên người dùng đăng bài
    
    private String userAvatar; // Ảnh đại diện người dùng
    
    private String userRole; // Vai trò người dùng
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề phải từ 5 đến 200 ký tự")
    private String title;
    
    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 10, max = 5000, message = "Nội dung phải từ 10 đến 5000 ký tự")
    private String content;
    
    private Timestamp createdAt;
    
    private Timestamp updatedAt;
    
    private Integer viewCount;
    
    private Boolean isDeleted;
    
    private PrivacyLevel privacyLevel;
    
    private String attachmentType;
    
    private String attachmentUrl;
    
    private String location;
    
    private String feeling;
    
    private String backgroundColor;
    
    private Boolean isPinned;
    
    private Boolean isEdited;
    
    private Timestamp editedAt;
    
    private Boolean isShared;
    
    private Integer originalPostId;
    
    private ForumPostDTO originalPost;
    
    private List<ForumPostImageDTO> images = new ArrayList<>();
    
    private List<HashtagDTO> hashtags = new ArrayList<>();
    
    private List<ForumReactionDTO> reactions = new ArrayList<>();
    
    private Map<String, Integer> reactionCounts;
    
    private Integer commentCount;
    
    private List<UserMentionDTO> mentions = new ArrayList<>();
    
    // Constructor cơ bản
    public ForumPostDTO(int id, int userId, String title, String content, Timestamp createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }
    
    // Constructor đầy đủ
    public ForumPostDTO(int id, int userId, String title, String content, Timestamp createdAt, List<ForumPostImageDTO> images) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        if (images != null) {
            this.images = images;
        }
    }
}
