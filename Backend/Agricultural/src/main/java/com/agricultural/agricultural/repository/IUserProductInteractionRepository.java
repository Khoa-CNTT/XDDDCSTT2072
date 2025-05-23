package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.UserProductInteraction;
import com.agricultural.agricultural.entity.UserProductInteraction.InteractionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserProductInteractionRepository extends JpaRepository<UserProductInteraction, Integer> {


    Optional<UserProductInteraction> findByUserIdAndProductIdAndType(Integer userId, Integer productId, InteractionType type);
    

    List<UserProductInteraction> findByUserId(Integer userId);
    

    List<UserProductInteraction> findByProductId(Integer productId);
    

    List<UserProductInteraction> findByUserIdOrderByUpdatedAtDesc(Integer userId);
    

    long countByProductIdAndType(Integer productId, InteractionType type);
    

    @Query("SELECT u.productId, COUNT(u) as viewCount FROM UserProductInteraction u " +
           "WHERE u.type = 'VIEW' " +
           "GROUP BY u.productId " +
           "ORDER BY viewCount DESC")
    List<Object[]> findMostViewedProducts(@Param("limit") int limit);
    

    @Query("SELECT u.productId, COUNT(u) as purchaseCount FROM UserProductInteraction u " +
           "WHERE u.type = 'PURCHASE' " +
           "GROUP BY u.productId " +
           "ORDER BY purchaseCount DESC")
    List<Object[]> findMostPurchasedProducts(@Param("limit") int limit);
    

    @Query("SELECT u.productId, SUM(u.interactionScore * u.interactionCount) as totalScore FROM UserProductInteraction u " +
           "GROUP BY u.productId " +
           "ORDER BY totalScore DESC")
    List<Object[]> findProductsWithHighestInteractionScore(@Param("limit") int limit);
    

    @Query("SELECT u.productId, SUM(u.interactionScore * u.interactionCount) as totalScore FROM UserProductInteraction u " +
           "WHERE u.userId = :userId " +
           "GROUP BY u.productId " +
           "ORDER BY totalScore DESC " +
           "LIMIT :limit")
    List<Object[]> findMostInteractedProductsByUser(@Param("userId") Integer userId, @Param("limit") int limit);
} 