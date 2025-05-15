package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.NotificationDTO;
import com.agricultural.agricultural.entity.Notification;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.NotificationMapper;
import com.agricultural.agricultural.repository.INotificationRepository;
import com.agricultural.agricultural.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements INotificationService {
    
    private final INotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public NotificationDTO createNotification(NotificationDTO notificationDTO) {
        notificationDTO.setCreatedAt(LocalDateTime.now());
        notificationDTO.setRead(false);
        
        // Đảm bảo trường message không null khi mapper từ content
        if (notificationDTO.getMessage() == null && notificationDTO.getContent() != null) {
            notificationDTO.setMessage(notificationDTO.getContent());
        } else if (notificationDTO.getContent() == null && notificationDTO.getMessage() != null) {
            notificationDTO.setContent(notificationDTO.getMessage());
        } else if (notificationDTO.getMessage() == null && notificationDTO.getContent() == null) {
            // Nếu cả 2 đều là null, đặt giá trị mặc định
            notificationDTO.setMessage("Bạn có thông báo mới");
            notificationDTO.setContent("Bạn có thông báo mới");
        }
        
        // Đảm bảo trường title không null
        if (notificationDTO.getTitle() == null) {
            // Tạo title dựa vào type hoặc đặt giá trị mặc định
            String title = "Thông báo mới";
            if (notificationDTO.getType() != null) {
                switch (notificationDTO.getType()) {
                    case "COMMENT":
                        title = "Bình luận mới";
                        break;
                    case "REPLY":
                        title = "Phản hồi mới";
                        break;
                    case "LIKE_COMMENT":
                        title = "Lượt thích mới";
                        break;
                    case "ORDER_NOTIFICATION":
                        title = "Thông báo đơn hàng";
                        break;
                    default:
                        title = "Thông báo mới";
                }
            }
            notificationDTO.setTitle(title);
        }
        
        // Xử lý việc ánh xạ userId và receiverId
        if (notificationDTO.getUserId() == null && notificationDTO.getReceiverId() != null) {
            notificationDTO.setUserId(notificationDTO.getReceiverId());
        } else if (notificationDTO.getReceiverId() == null && notificationDTO.getUserId() != null) {
            notificationDTO.setReceiverId(notificationDTO.getUserId());
        } else if (notificationDTO.getUserId() == null && notificationDTO.getReceiverId() == null) {
            throw new IllegalArgumentException("Thông báo phải có người nhận (userId hoặc receiverId)");
        }
        
        Notification notification = notificationMapper.toEntity(notificationDTO);
        notification = notificationRepository.save(notification);
        
        return notificationMapper.toDTO(notification);
    }

    @Override
    public List<NotificationDTO> getUserNotifications(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notificationMapper.toDTOList(notifications);
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notificationMapper.toDTOList(notifications);
    }

    @Override
    public NotificationDTO markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        
        notification.setRead(true);
        notification = notificationRepository.save(notification);
        
        return notificationMapper.toDTO(notification);
    }

    @Override
    public void markAllAsRead(Integer userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Override
    public Long countUnreadNotifications(Integer userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    public void sendRealTimeNotification(NotificationDTO notificationDTO) {
        // Lưu thông báo vào DB
        NotificationDTO savedNotification = createNotification(notificationDTO);
        
        // Gửi thông báo realtime đến user cụ thể
        messagingTemplate.convertAndSendToUser(
                notificationDTO.getUserId().toString(),
                "/queue/notifications",
                savedNotification
        );
    }

    @Override
    public void sendRealTimeNotificationToAll(NotificationDTO notificationDTO) {
        // Gửi thông báo đến tất cả users đang kết nối 
        // (không lưu vào DB vì không có userId cụ thể)
        messagingTemplate.convertAndSend("/topic/notifications", notificationDTO);
    }
    
    @Override
    public void sendOrderNotification(Integer userId, String title, String message) {
        NotificationDTO notificationDTO = NotificationDTO.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .content(message)
                .type("ORDER_NOTIFICATION")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
                
        // Lưu thông báo vào DB và gửi realtime
        sendRealTimeNotification(notificationDTO);
    }
} 