package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
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
public interface IPaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Integer orderId);
    List<Payment> findAllByOrderIdOrderByCreatedAtDesc(Integer orderId);
    Optional<Payment> findByOrderIdOrderByCreatedAtDesc(Integer orderId);
    Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(Long orderId);
    
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByTransactionReference(String transactionReference);
    Optional<Payment> findByPaymentId(String paymentId);
    
    @Query("SELECT p FROM Payment p WHERE p.transactionId = :reference OR p.transactionReference = :reference")
    Optional<Payment> findByAnyTransactionReference(String reference);
    
    Optional<Payment> findFirstByPaymentNoteContainingOrderByCreatedAtDesc(String paymentNote);
    
    @Query(value = "SELECT * FROM payment WHERE payment_note LIKE %:keyword% ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Optional<Payment> findLatestByPaymentNoteKeyword(@Param("keyword") String keyword);
    
    @Query(value = "SELECT * FROM payment WHERE payment_note LIKE %:keyValue%", nativeQuery = true)
    Optional<Payment> findByPaymentNoteContaining(@Param("keyValue") String keyValue);
    
    @Query(value = "SELECT * FROM payment WHERE payment_note LIKE %:keyword% ORDER BY created_at DESC", nativeQuery = true)
    List<Payment> findAllByPaymentNoteKeyword(@Param("keyword") String keyword);
    
    @Query(value = "SELECT * FROM payment WHERE payment_note LIKE '%vnp_TransactionNo=%' AND payment_note LIKE %:transactionNo% ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Optional<Payment> findByVnpTransactionNo(@Param("transactionNo") String transactionNo);
    
    @Query(value = "SELECT * FROM payment WHERE transaction_id = :transactionRef OR transaction_reference = :transactionRef OR payment_note LIKE %:transactionRef% ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Optional<Payment> findByAllReferences(@Param("transactionRef") String transactionRef);
    
    List<Payment> findByStatus(PaymentStatus status);
    Page<Payment> findAllByStatus(PaymentStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Payment p WHERE p.userId = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserId(@Param("userId") Long userId);
    Page<Payment> findAllByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT p FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt BETWEEN :start AND :end")
    List<Payment> findAllCompletedBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt BETWEEN :start AND :end")
    Long countCompletedBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt BETWEEN :start AND :end")
    Long sumCompletedBetween(LocalDateTime start, LocalDateTime end);
} 