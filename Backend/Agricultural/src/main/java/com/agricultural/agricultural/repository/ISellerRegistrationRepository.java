package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.SellerRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ISellerRegistrationRepository extends JpaRepository<SellerRegistration, Integer> {
    

    Optional<SellerRegistration> findFirstByUserIdOrderByCreatedAtDesc(Integer userId);
    

    List<SellerRegistration> findByUserIdOrderByCreatedAtDesc(Integer userId);
    

    List<SellerRegistration> findByStatusOrderByCreatedAtDesc(String status);
    

    boolean existsByUserIdAndStatus(Integer userId, String status);
    

    boolean existsByUserIdAndStatusEquals(Integer userId, String status);
    

    @Query("SELECT sr FROM SellerRegistration sr JOIN FETCH sr.user ORDER BY CASE WHEN sr.createdAt IS NULL THEN 0 ELSE 1 END, sr.id DESC")
    List<SellerRegistration> findAllWithUsers();
    

    @Query("SELECT sr FROM SellerRegistration sr JOIN FETCH sr.user WHERE sr.status = :status ORDER BY CASE WHEN sr.createdAt IS NULL THEN 0 ELSE 1 END, sr.createdAt DESC, sr.id DESC")
    List<SellerRegistration> findByStatusWithUsers(String status);
} 