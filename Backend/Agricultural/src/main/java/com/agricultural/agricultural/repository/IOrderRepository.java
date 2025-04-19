package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Order;
import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IOrderRepository extends JpaRepository<Order, Integer> {
    Page<Order> findByBuyerId(Integer buyerId, Pageable pageable);
    List<Order> findByBuyerId(Integer buyerId);
    Page<Order> findBySellerId(Integer sellerId, Pageable pageable);
    List<Order> findBySellerId(Integer sellerId);
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findByBuyerIdAndStatus(Integer buyerId, OrderStatus status, Pageable pageable);
    Page<Order> findBySellerIdAndStatus(Integer sellerId, OrderStatus status, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.buyer " +
           "LEFT JOIN FETCH o.seller " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH od.product " +
           "WHERE o.id = :orderId")
    Optional<Order> findOrderWithDetails(@Param("orderId") Integer orderId);

    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.buyerId = :userId AND o.status = :status")
    List<Order> findByUserIdAndStatus(Integer userId, OrderStatus status);
} 