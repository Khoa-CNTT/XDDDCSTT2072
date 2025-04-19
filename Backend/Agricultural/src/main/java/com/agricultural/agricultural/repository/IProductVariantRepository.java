package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IProductVariantRepository extends JpaRepository<ProductVariant, Integer> {

    List<ProductVariant> findByProductId(Integer productId);
    
    boolean existsBySku(String sku);
    
    ProductVariant findBySku(String sku);
} 