package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.OrderTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Integer> {
    List<OrderTracking> findByOrderIdOrderByTimestampDesc(Integer orderId);
} 