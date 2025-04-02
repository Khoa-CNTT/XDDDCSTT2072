package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.entity.Notification;
import com.agricultural.agricultural.repository.NotificationRepository;
import com.agricultural.agricultural.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements INotificationService {
    private final NotificationRepository notificationRepository;
    
    @Override
    public void sendOrderNotification(Integer userId, String title, String message) {
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
        }
    }
} 