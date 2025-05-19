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

    /**
     * Tìm tương tác của người dùng với sản phẩm
     */
    Optional<UserProductInteraction> findByUserIdAndProductIdAndType(Integer userId, Integer productId, InteractionType type);
    
    /**
     * Lấy tất cả tương tác của người dùng
     */
    List<UserProductInteraction> findByUserId(Integer userId);
    
    /**
     * Lấy tất cả tương tác với một sản phẩm
     */
    List<UserProductInteraction> findByProductId(Integer productId);
    
    /**
     * Lấy tương tác sắp xếp theo thời gian cập nhật (gần nhất lên đầu)
     */
    List<UserProductInteraction> findByUserIdOrderByUpdatedAtDesc(Integer userId);
    
    /**
     * Đếm số lượng tương tác theo loại
     */
    long countByProductIdAndType(Integer productId, InteractionType type);
    
    /**
     * Lấy danh sách sản phẩm được xem nhiều nhất
     */
    @Query("SELECT u.productId, COUNT(u) as viewCount FROM UserProductInteraction u " +
           "WHERE u.type = 'VIEW' " +
           "GROUP BY u.productId " +
           "ORDER BY viewCount DESC")
    List<Object[]> findMostViewedProducts(@Param("limit") int limit);
    
    /**
     * Lấy danh sách sản phẩm được mua nhiều nhất
     */
    @Query("SELECT u.productId, COUNT(u) as purchaseCount FROM UserProductInteraction u " +
           "WHERE u.type = 'PURCHASE' " +
           "GROUP BY u.productId " +
           "ORDER BY purchaseCount DESC")
    List<Object[]> findMostPurchasedProducts(@Param("limit") int limit);
    
    /**
     * Lấy danh sách sản phẩm tương tác nhiều nhất (điểm tương tác cao nhất)
     */
    @Query("SELECT u.productId, SUM(u.interactionScore * u.interactionCount) as totalScore FROM UserProductInteraction u " +
           "GROUP BY u.productId " +
           "ORDER BY totalScore DESC")
    List<Object[]> findProductsWithHighestInteractionScore(@Param("limit") int limit);
    
    /**
     * Lấy danh sách sản phẩm tương tác nhiều nhất của một người dùng
     */
    @Query("SELECT u.productId, SUM(u.interactionScore * u.interactionCount) as totalScore FROM UserProductInteraction u " +
           "WHERE u.userId = :userId " +
           "GROUP BY u.productId " +
           "ORDER BY totalScore DESC " +
           "LIMIT :limit")
    List<Object[]> findMostInteractedProductsByUser(@Param("userId") Integer userId, @Param("limit") int limit);
} 