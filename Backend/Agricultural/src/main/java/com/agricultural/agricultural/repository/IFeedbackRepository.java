package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IFeedbackRepository extends JpaRepository<Feedback, Integer> {
    
    List<Feedback> findByProductIdAndStatus(Integer productId, String status);
    
    Page<Feedback> findByProductIdAndStatus(Integer productId, String status, Pageable pageable);
    
    List<Feedback> findByUserIdOrderByReviewDateDesc(Integer userId);
    
    Page<Feedback> findByUserIdOrderByReviewDateDesc(Integer userId, Pageable pageable);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.productId = :productId AND f.status = 'APPROVED'")
    Double getAverageRatingByProductId(Integer productId);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.productId = :productId AND f.status = 'APPROVED'")
    Long countApprovedByProductId(Integer productId);
    
    Optional<Feedback> findByUserIdAndProductId(Integer userId, Integer productId);
    
    List<Feedback> findByStatusOrderByReviewDateDesc(String status);
    
    Page<Feedback> findByStatusOrderByReviewDateDesc(String status, Pageable pageable);
    
    @Query("SELECT f FROM Feedback f WHERE f.rating >= :minRating AND f.productId = :productId AND f.status = 'APPROVED'")
    Page<Feedback> findByMinRatingAndProductId(Integer productId, Integer minRating, Pageable pageable);
    
    @Query("SELECT f FROM Feedback f WHERE f.productId = :productId AND f.isVerifiedPurchase = true AND f.status = 'APPROVED'")
    Page<Feedback> findVerifiedPurchaseByProductId(Integer productId, Pageable pageable);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.productId = :productId AND f.rating = :rating AND f.status = 'APPROVED'")
    Long countByProductIdAndRating(Integer productId, Integer rating);
} 