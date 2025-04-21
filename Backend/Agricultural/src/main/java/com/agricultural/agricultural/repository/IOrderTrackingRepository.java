package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.OrderTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface IOrderTrackingRepository extends JpaRepository<OrderTracking, Integer> {
    List<OrderTracking> findByOrderIdOrderByTimestampDesc(Integer orderId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderTracking ot WHERE ot.orderId = :orderId")
    void deleteByOrderId(Integer orderId);
} 