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
    
    // Tìm tất cả ảnh theo sản phẩm, sắp xếp theo thứ tự hiển thị
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Integer productId);
    
    // Tìm ảnh chính của sản phẩm
    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(Integer productId);
    
    // Đếm số lượng ảnh của sản phẩm
    long countByProductId(Integer productId);
    
    // Xóa tất cả ảnh của sản phẩm
    @Transactional
    void deleteByProductId(Integer productId);
    
    // Cập nhật ảnh không còn là ảnh chính
    @Modifying
    @Transactional
    @Query("UPDATE ProductImage p SET p.isPrimary = false WHERE p.product.id = :productId")
    void unsetPrimaryForAllProductImages(@Param("productId") Integer productId);
    
    // Tìm ảnh theo thứ tự hiển thị
    Optional<ProductImage> findByProductIdAndDisplayOrder(Integer productId, Integer displayOrder);
    
    // Tìm ảnh với thứ tự hiển thị lớn nhất
    @Query("SELECT MAX(p.displayOrder) FROM ProductImage p WHERE p.product.id = :productId")
    Integer findMaxDisplayOrderByProductId(@Param("productId") Integer productId);
} 