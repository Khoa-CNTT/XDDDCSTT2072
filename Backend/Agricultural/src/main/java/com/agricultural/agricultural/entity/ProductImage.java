package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private MarketPlace product;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "title")
    private String title;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "display_order")
    private Integer displayOrder;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Phương thức kiểm tra xem có phải ảnh chính không
    public boolean isPrimary() {
        return isPrimary != null && isPrimary;
    }
    
    // Phương thức kiểm tra xem ảnh có đầy đủ thông tin meta hay không
    public boolean hasMetaInfo() {
        return altText != null && !altText.isEmpty() && title != null && !title.isEmpty();
    }
    
    // Phương thức lấy tên file từ URL
    public String getFileName() {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        int lastSlashIndex = imageUrl.lastIndexOf('/');
        if (lastSlashIndex < 0 || lastSlashIndex >= imageUrl.length() - 1) {
            return imageUrl;
        }
        
        return imageUrl.substring(lastSlashIndex + 1);
    }
    
    // Phương thức lấy extension của file từ URL
    public String getFileExtension() {
        String fileName = getFileName();
        if (fileName == null) {
            return null;
        }
        
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex < 0 || lastDotIndex >= fileName.length() - 1) {
            return null;
        }
        
        return fileName.substring(lastDotIndex + 1).toLowerCase();
    }
    
    // Phương thức kiểm tra xem có phải là hình ảnh không
    public boolean isImage() {
        String ext = getFileExtension();
        if (ext == null) {
            return false;
        }
        
        return ext.equals("jpg") || ext.equals("jpeg") || ext.equals("png") || 
               ext.equals("gif") || ext.equals("webp") || ext.equals("svg");
    }
} 