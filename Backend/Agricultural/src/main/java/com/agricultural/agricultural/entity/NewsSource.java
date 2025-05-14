package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "news_sources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsSource extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, length = 500)
    private String articleSelector; // CSS selector để lấy các bài viết

    @Column(nullable = false, length = 255)
    private String titleSelector; // CSS selector để lấy tiêu đề

    @Column(length = 255)
    private String summarySelector; // CSS selector để lấy tóm tắt (có thể null)

    @Column(length = 255)
    private String contentSelector; // CSS selector để lấy nội dung

    @Column(length = 255)
    private String imageSelector; // CSS selector để lấy ảnh

    @Column(length = 255)
    private String dateSelector; // CSS selector để lấy ngày đăng

    @Column(length = 500)
    private String dateFormat; // Định dạng ngày
    
    @Column(nullable = false, length = 255)
    private String category; // Danh mục tin tức

    @Column(nullable = false)
    private Boolean active = true;
}