package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.MarketPlace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketPlaceRepository extends JpaRepository<MarketPlace, Integer> {
    Page<MarketPlace> findByUserId(Integer userId, Pageable pageable);
    
    @Query("SELECT m FROM MarketPlace m WHERE " +
           "LOWER(m.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<MarketPlace> searchProducts(String keyword, Pageable pageable);
    
    @Query("SELECT m FROM MarketPlace m WHERE m.quantity > 0")
    Page<MarketPlace> findAvailableProducts(Pageable pageable);
    
    List<MarketPlace> findByQuantityGreaterThan(Integer quantity);
} 