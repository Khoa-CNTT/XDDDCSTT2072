package com.agricultural.agricultural.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

//import java.security.Timestamp;
import java.sql.Time;
import java.sql.Timestamp;

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
}
