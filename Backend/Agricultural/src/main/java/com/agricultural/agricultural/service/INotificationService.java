package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.NotificationDTO;

import java.util.List;

public interface INotificationService {
    NotificationDTO createNotification(NotificationDTO notificationDTO);

    List<NotificationDTO> getUserNotifications(Integer userId);

    List<NotificationDTO> getUnreadNotifications(Integer userId);

    NotificationDTO markAsRead(Integer notificationId);

    void markAllAsRead(Integer userId);

    Long countUnreadNotifications(Integer userId);

    void sendRealTimeNotification(NotificationDTO notificationDTO);

    void sendRealTimeNotificationToAll(NotificationDTO notificationDTO);

    void sendOrderNotification(Integer userId, String title, String message);
} 