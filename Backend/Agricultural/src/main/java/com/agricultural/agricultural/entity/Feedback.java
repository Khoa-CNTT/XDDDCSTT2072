package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.entity.enumeration.FeedbackStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "product_id")
    private Integer productId;
    
    @Column(name = "rating")
    private Integer rating;
    
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "review_date")
    @CreationTimestamp
    private LocalDateTime reviewDate;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "status")
    @Builder.Default 
    private String status = "PENDING";
    
    @Column(name = "is_verified_purchase")
    @Builder.Default
    private Boolean isVerifiedPurchase = false;
    
    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;
    
    @Column(name = "not_helpful_count")
    @Builder.Default
    private Integer notHelpfulCount = 0;
    
    @Column(name = "reply", columnDefinition = "TEXT")
    private String reply;
    
    @Column(name = "replied_by")
    private Integer repliedBy;
    
    @Column(name = "replied_at")
    private LocalDateTime repliedAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private MarketPlace product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replied_by", insertable = false, updatable = false)
    private User repliedByUser;
    
    @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FeedbackImage> images = new ArrayList<>();
    
    public void addImage(FeedbackImage image) {
        images.add(image);
        image.setFeedback(this);
    }
    
    public void removeImage(FeedbackImage image) {
        images.remove(image);
        image.setFeedback(null);
    }
    
    @Transient
    public FeedbackStatus getStatusEnum() {
        return FeedbackStatus.fromString(status);
    }
    
    public void setStatusEnum(FeedbackStatus statusEnum) {
        if (statusEnum != null) {
            this.status = statusEnum.name();
        }
    }
} 