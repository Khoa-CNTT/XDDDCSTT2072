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
} 