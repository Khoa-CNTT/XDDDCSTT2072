package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByOrderId(Integer orderId);
    Optional<Payment> findByPaymentId(String paymentId);
    List<Payment> findByStatus(PaymentStatus status);
    Optional<Payment> findTopByOrderIdOrderByPaymentDateDesc(Integer orderId);
} 