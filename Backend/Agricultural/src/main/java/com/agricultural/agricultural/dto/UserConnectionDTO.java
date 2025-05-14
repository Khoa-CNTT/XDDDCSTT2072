package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho kết nối giữa người dùng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserConnectionDTO {
    private Integer id;
    
    private Integer userId;
    private String userName;
    private String userAvatar;
    
    private Integer connectedUserId;
    private String connectedUserName;
    private String connectedUserAvatar;
    
    private String status; // PENDING, ACCEPTED, REJECTED, BLOCKED
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 