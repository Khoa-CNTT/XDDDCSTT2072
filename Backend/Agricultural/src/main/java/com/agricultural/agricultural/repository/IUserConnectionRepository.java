package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.UserConnection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserConnectionRepository extends JpaRepository<UserConnection, Integer> {
    
    /**
     * Tìm kết nối giữa hai người dùng
     */
    Optional<UserConnection> findByUserIdAndConnectedUserId(Integer userId, Integer connectedUserId);
    
    /**
     * Tìm tất cả kết nối của một người dùng
     */
    List<UserConnection> findAllByUserId(Integer userId);
    
    /**
     * Tìm tất cả kết nối của một người dùng với phân trang
     */
    Page<UserConnection> findAllByUserId(Integer userId, Pageable pageable);
    
    /**
     * Tìm tất cả kết nối có trạng thái cụ thể của một người dùng
     */
    List<UserConnection> findAllByUserIdAndStatus(Integer userId, UserConnection.ConnectionStatus status);
    
    /**
     * Tìm tất cả kết nối đến một người dùng
     */
    List<UserConnection> findAllByConnectedUserId(Integer connectedUserId);
    
    /**
     * Tìm tất cả kết nối đến một người dùng với trạng thái cụ thể
     */
    List<UserConnection> findAllByConnectedUserIdAndStatus(Integer connectedUserId, UserConnection.ConnectionStatus status);
    
    /**
     * Kiểm tra hai người dùng có kết nối chấp nhận với nhau không
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM UserConnection c " + 
           "WHERE ((c.user.id = :userId1 AND c.connectedUser.id = :userId2) OR " + 
           "(c.user.id = :userId2 AND c.connectedUser.id = :userId1)) AND c.status = 'ACCEPTED'")
    boolean areConnected(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);
    
    /**
     * Tìm tất cả người dùng kết nối với một người dùng
     */
    @Query("SELECT c.connectedUser.id FROM UserConnection c WHERE c.user.id = :userId AND c.status = 'ACCEPTED'")
    List<Integer> findConnectedUserIdsByUserId(@Param("userId") Integer userId);
    
    /**
     * Đếm số lượng kết nối được chấp nhận của một người dùng
     */
    @Query("SELECT COUNT(c) FROM UserConnection c WHERE (c.user.id = :userId OR c.connectedUser.id = :userId) AND c.status = 'ACCEPTED'")
    long countConnectionsByUserId(@Param("userId") Integer userId);
} 