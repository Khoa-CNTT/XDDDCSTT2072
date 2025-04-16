package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.entity.Notification;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.repository.INotificationRepository;
import com.agricultural.agricultural.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements INotificationService {
    private final INotificationRepository notificationRepository;
    
    @Override
    public void sendOrderNotification(Integer userId, String title, String message) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (title == null || title.trim().isEmpty()) {
            throw new BadRequestException("Tiêu đề thông báo không được để trống");
        }
        
        if (message == null || message.trim().isEmpty()) {
            throw new BadRequestException("Nội dung thông báo không được để trống");
        }
        
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            
            notificationRepository.save(notification);
            
            // Trong tương lai có thể tích hợp với WebSocket để gửi thông báo realtime
            log.info("Đã gửi thông báo cho user {}: {}", userId, title);
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo: {}", e.getMessage());
            throw new BadRequestException("Không thể gửi thông báo: " + e.getMessage());
        }
    }
} 