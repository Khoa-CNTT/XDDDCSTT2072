package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ProductRelationship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IProductRelationshipRepository extends JpaRepository<ProductRelationship, Integer> {

    /**
     * Tìm mối quan hệ giữa hai sản phẩm
     */
    Optional<ProductRelationship> findBySourceProductIdAndTargetProductIdAndRelationshipType(
            Integer sourceProductId, Integer targetProductId, ProductRelationship.RelationshipType relationshipType);
    
    /**
     * Lấy tất cả mối quan hệ của sản phẩm nguồn
     */
    List<ProductRelationship> findBySourceProductId(Integer sourceProductId);
    
    /**
     * Lấy tất cả mối quan hệ của sản phẩm nguồn theo loại
     */
    List<ProductRelationship> findBySourceProductIdAndRelationshipType(
            Integer sourceProductId, ProductRelationship.RelationshipType relationshipType);
    
    /**
     * Lấy danh sách sản phẩm tương tự cho một sản phẩm
     */
    @Query("SELECT p FROM ProductRelationship p " +
           "WHERE p.sourceProductId = :productId " +
           "AND p.relationshipType = 'SIMILAR' " +
           "ORDER BY p.strengthScore DESC")
    Page<ProductRelationship> findSimilarProducts(@Param("productId") Integer productId, Pageable pageable);
    
    /**
     * Lấy danh sách sản phẩm thường mua cùng
     */
    @Query("SELECT p FROM ProductRelationship p " +
           "WHERE p.sourceProductId = :productId " +
           "AND p.relationshipType = 'BOUGHT_TOGETHER' " +
           "ORDER BY p.occurrenceCount DESC, p.strengthScore DESC " +
           "LIMIT :limit")
    List<ProductRelationship> findFrequentlyBoughtTogether(@Param("productId") Integer productId, @Param("limit") int limit);
    
    /**
     * Lấy danh sách sản phẩm thường xem cùng
     */
    @Query("SELECT p FROM ProductRelationship p " +
           "WHERE p.sourceProductId = :productId " +
           "AND p.relationshipType = 'VIEWED_TOGETHER' " +
           "ORDER BY p.occurrenceCount DESC, p.strengthScore DESC " +
           "LIMIT :limit")
    List<ProductRelationship> findFrequentlyViewedTogether(@Param("productId") Integer productId, @Param("limit") int limit);
    
    /**
     * Xóa tất cả mối quan hệ của một sản phẩm
     */
    void deleteBySourceProductIdOrTargetProductId(Integer productId, Integer sameProductId);
} 