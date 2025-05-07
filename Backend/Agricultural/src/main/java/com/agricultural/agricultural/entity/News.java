package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class News extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(nullable = false)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 1000)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 500)
    private String sourceUrl;

    @Column(nullable = false, length = 255)
    private String sourceName;

    @Column(nullable = false)
    private LocalDateTime publishedDate;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, length = 255)
    private String category;

    @Column(length = 500)
    private String tags;
    
    @Column(nullable = false, unique = true)
    private String uniqueId; // Lưu trữ ID độc nhất để tránh trùng lặp
} 