package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Integer> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    Page<Notification> findByUserId(Integer userId, Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.read = false")
    Long countUnreadByUserId(Integer userId);
} 