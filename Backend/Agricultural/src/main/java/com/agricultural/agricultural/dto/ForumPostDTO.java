package com.agricultural.agricultural.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@RequiredArgsConstructor
public class ForumPostDTO {
    private int id;
    private int userId;  // Liên kết với người dùng tạo bài viết
    private String title;
    private String content;
    private Timestamp createdAt;

    public ForumPostDTO(int id, int userId, String title, String content, Timestamp createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }
}
