package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {
    
    // Tìm danh mục theo tên
    Optional<ProductCategory> findByName(String name);
    
    // Tìm danh mục con
    List<ProductCategory> findByParentId(Integer parentId);
    
    // Tìm danh mục gốc (không có parent)
    List<ProductCategory> findByParentIsNull();
    
    // Tìm danh mục có sản phẩm
    @Query("SELECT DISTINCT pc FROM ProductCategory pc JOIN pc.products p WHERE p.id IS NOT NULL")
    List<ProductCategory> findCategoriesWithProducts();
    
    // Tìm danh mục theo trạng thái active
    List<ProductCategory> findByIsActive(Boolean isActive);
    
    // Tìm danh mục theo tên chứa keyword
    Page<ProductCategory> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    
    // Sắp xếp theo thứ tự hiển thị
    List<ProductCategory> findAllByOrderByDisplayOrderAsc();
    
    // Kiểm tra tên đã tồn tại chưa
    boolean existsByNameIgnoreCase(String name);
    
    // Đếm số lượng sản phẩm trong danh mục
    @Query("SELECT COUNT(p) FROM MarketPlace p WHERE p.category.id = :categoryId")
    long countProductsByCategoryId(@Param("categoryId") Integer categoryId);
    
    // Kiểm tra danh mục có danh mục con không
    boolean existsByParentId(Integer parentId);
} 