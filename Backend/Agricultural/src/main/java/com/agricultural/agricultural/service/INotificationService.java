package com.agricultural.agricultural.service;

public interface INotificationService {
    void sendOrderNotification(Integer userId, String title, String message);
} 