package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.NotificationDTO;
import com.agricultural.agricultural.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final INotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }
    
    @GetMapping("/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }
    
    @GetMapping("/{userId}/count-unread")
    public ResponseEntity<Long> countUnreadNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(userId));
    }
    
    @PutMapping("/{notificationId}/mark-read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Integer notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }
    
    @PutMapping("/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Integer userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationDTO notificationDTO) {
        return new ResponseEntity<>(notificationService.createNotification(notificationDTO), HttpStatus.CREATED);
    }
    
    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(@RequestBody NotificationDTO notificationDTO) {
        notificationService.sendRealTimeNotification(notificationDTO);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/broadcast")
    public ResponseEntity<Void> broadcastNotification(@RequestBody NotificationDTO notificationDTO) {
        notificationService.sendRealTimeNotificationToAll(notificationDTO);
        return ResponseEntity.ok().build();
    }
    
    // API cho admin gửi thông báo hệ thống (broadcast)
    @PostMapping("/admin/broadcast")
    @PreAuthorize("hasRole('Admin') or hasRole('ROLE_Admin')")
    public ResponseEntity<Void> adminBroadcastNotification(@RequestBody NotificationDTO notificationDTO) {
        notificationService.sendRealTimeNotificationToAll(notificationDTO);
        return ResponseEntity.ok().build();
    }
    
    // WebSocket endpoints
    
    @MessageMapping("/notification.private")
    public void sendPrivateNotification(NotificationDTO notificationDTO) {
        notificationService.sendRealTimeNotification(notificationDTO);
    }
    
    @MessageMapping("/notification.broadcast")
    @SendTo("/topic/notifications")
    public NotificationDTO handleBroadcastNotification(NotificationDTO notificationDTO) {
        return notificationDTO;
    }
} 