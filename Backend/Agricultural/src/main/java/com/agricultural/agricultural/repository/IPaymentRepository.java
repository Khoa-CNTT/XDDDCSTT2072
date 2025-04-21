package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByOrderIdOrderByCreatedAtDesc(Integer orderId);
    List<Payment> findAllByOrderIdOrderByCreatedAtDesc(Integer orderId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByStatus(PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.userId = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserId(Long userId);

    Optional<Payment> findByPaymentId(String paymentId);
} 