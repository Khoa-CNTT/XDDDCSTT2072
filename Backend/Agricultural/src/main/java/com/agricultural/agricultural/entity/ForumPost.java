package com.agricultural.agricultural.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

//import java.security.Timestamp;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

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
    private String content;

    @Column(name = "created_at")
    private Timestamp createdAt;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ForumPostImage> images = new ArrayList<>();
    
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
}
