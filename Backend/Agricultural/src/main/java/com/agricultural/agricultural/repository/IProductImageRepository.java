package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface IProductImageRepository extends JpaRepository<ProductImage, Integer> {
    
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Integer productId);
    
    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(Integer productId);
    
    long countByProductId(Integer productId);
    
    @Transactional
    void deleteByProductId(Integer productId);
    
    @Modifying
    @Transactional
    @Query("UPDATE ProductImage p SET p.isPrimary = false WHERE p.product.id = :productId")
    void unsetPrimaryForAllProductImages(@Param("productId") Integer productId);
    
    Optional<ProductImage> findByProductIdAndDisplayOrder(Integer productId, Integer displayOrder);
    
    @Query("SELECT MAX(p.displayOrder) FROM ProductImage p WHERE p.product.id = :productId")
    Integer findMaxDisplayOrderByProductId(@Param("productId") Integer productId);
} 