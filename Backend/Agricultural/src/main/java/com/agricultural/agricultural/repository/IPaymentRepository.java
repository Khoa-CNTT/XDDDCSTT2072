package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByOrderIdOrderByCreatedAtDesc(Integer orderId);
    List<Payment> findAllByOrderIdOrderByCreatedAtDesc(Integer orderId);
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByTransactionReference(String transactionReference);
    Optional<Payment> findFirstByPaymentNoteContainingOrderByCreatedAtDesc(String paymentNote);
    List<Payment> findByStatus(PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.userId = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserId(Long userId);

    Optional<Payment> findByPaymentId(String paymentId);
    
    // Thêm query mới với câu truy vấn tùy chỉnh để lấy payment mới nhất dựa trên một phần của payment_note
    @Query(value = "SELECT * FROM payment p WHERE p.payment_note LIKE %:keyword% ORDER BY p.created_at DESC LIMIT 1", nativeQuery = true)
    Optional<Payment> findLatestByPaymentNoteKeyword(@Param("keyword") String keyword);
    
    // Tìm tất cả payment có chứa keyword trong payment_note
    @Query(value = "SELECT * FROM payment p WHERE p.payment_note LIKE %:keyword% ORDER BY p.created_at DESC", nativeQuery = true)
    List<Payment> findAllByPaymentNoteKeyword(@Param("keyword") String keyword);
} 