package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Integer id;
    private Integer userId;
    private String title;
    private String message;
    private LocalDateTime createdAt;
    private Boolean read;
    private String type; // Thêm type để phân loại thông báo: đơn hàng, hệ thống, thời tiết, etc.
    private String redirectUrl; // URL để redirect khi click vào thông báo
    
    // Thêm các trường cho thông báo diễn đàn
    private Integer receiverId; // ID người nhận thông báo
    private Integer senderId;   // ID người gửi thông báo
    private String content;     // Nội dung thông báo
    private Integer entityId;   // ID của đối tượng liên quan (comment, post, etc.)
    private String entityType;  // Loại đối tượng (FORUM_REPLY, FORUM_POST, etc.)
    private Integer relatedEntityId;   // ID của đối tượng liên quan cấp 2
    private String relatedEntityType;  // Loại đối tượng liên quan cấp 2
} 