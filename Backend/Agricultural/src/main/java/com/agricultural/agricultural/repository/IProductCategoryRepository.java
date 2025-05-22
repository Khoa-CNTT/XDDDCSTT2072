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
import java.util.Set;

@Repository
public interface IProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {
    
    Optional<ProductCategory> findByName(String name);
    
    List<ProductCategory> findByNameIn(Set<String> names);
    
    List<ProductCategory> findByParentId(Integer parentId);
    
    List<ProductCategory> findByParentIsNull();
    @Query("SELECT DISTINCT pc FROM ProductCategory pc JOIN pc.products p WHERE p.id IS NOT NULL")
    List<ProductCategory> findCategoriesWithProducts();
    
    List<ProductCategory> findByIsActive(Boolean isActive);
    
    Page<ProductCategory> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    
    List<ProductCategory> findAllByOrderByDisplayOrderAsc();
    
    boolean existsByNameIgnoreCase(String name);
    
    @Query("SELECT COUNT(p) FROM MarketPlace p WHERE p.category.id = :categoryId")
    long countProductsByCategoryId(@Param("categoryId") Integer categoryId);
    
    boolean existsByParentId(Integer parentId);
} 