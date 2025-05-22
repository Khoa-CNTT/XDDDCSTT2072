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


    Optional<ProductRelationship> findBySourceProductIdAndTargetProductIdAndRelationshipType(
            Integer sourceProductId, Integer targetProductId, ProductRelationship.RelationshipType relationshipType);
    

    List<ProductRelationship> findBySourceProductId(Integer sourceProductId);
    

    List<ProductRelationship> findBySourceProductIdAndRelationshipType(
            Integer sourceProductId, ProductRelationship.RelationshipType relationshipType);
    

    @Query("SELECT p FROM ProductRelationship p " +
           "WHERE p.sourceProductId = :productId " +
           "AND p.relationshipType = 'SIMILAR' " +
           "ORDER BY p.strengthScore DESC")
    Page<ProductRelationship> findSimilarProducts(@Param("productId") Integer productId, Pageable pageable);
    

    @Query("SELECT p FROM ProductRelationship p " +
           "WHERE p.sourceProductId = :productId " +
           "AND p.relationshipType = 'BOUGHT_TOGETHER' " +
           "ORDER BY p.occurrenceCount DESC, p.strengthScore DESC " +
           "LIMIT :limit")
    List<ProductRelationship> findFrequentlyBoughtTogether(@Param("productId") Integer productId, @Param("limit") int limit);
    

    @Query("SELECT p FROM ProductRelationship p " +
           "WHERE p.sourceProductId = :productId " +
           "AND p.relationshipType = 'VIEWED_TOGETHER' " +
           "ORDER BY p.occurrenceCount DESC, p.strengthScore DESC " +
           "LIMIT :limit")
    List<ProductRelationship> findFrequentlyViewedTogether(@Param("productId") Integer productId, @Param("limit") int limit);
    

    void deleteBySourceProductIdOrTargetProductId(Integer productId, Integer sameProductId);
} 