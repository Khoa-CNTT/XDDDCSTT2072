package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedback_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "feedback_id", nullable = false)
    private Integer feedbackId;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id", insertable = false, updatable = false)
    private Feedback feedback;
} 