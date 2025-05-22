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
    

    Optional<UserConnection> findByUserIdAndConnectedUserId(Integer userId, Integer connectedUserId);
    

    List<UserConnection> findAllByUserId(Integer userId);
    

    Page<UserConnection> findAllByUserId(Integer userId, Pageable pageable);
    

    List<UserConnection> findAllByUserIdAndStatus(Integer userId, UserConnection.ConnectionStatus status);
    

    List<UserConnection> findAllByConnectedUserId(Integer connectedUserId);
    

    List<UserConnection> findAllByConnectedUserIdAndStatus(Integer connectedUserId, UserConnection.ConnectionStatus status);
    

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM UserConnection c " + 
           "WHERE ((c.user.id = :userId1 AND c.connectedUser.id = :userId2) OR " + 
           "(c.user.id = :userId2 AND c.connectedUser.id = :userId1)) AND c.status = 'ACCEPTED'")
    boolean areConnected(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);
    

    @Query("SELECT c.connectedUser.id FROM UserConnection c WHERE c.user.id = :userId AND c.status = 'ACCEPTED'")
    List<Integer> findConnectedUserIdsByUserId(@Param("userId") Integer userId);
    

    @Query("SELECT COUNT(c) FROM UserConnection c WHERE (c.user.id = :userId OR c.connectedUser.id = :userId) AND c.status = 'ACCEPTED'")
    long countConnectionsByUserId(@Param("userId") Integer userId);
    

    @Query("SELECT DISTINCT CASE WHEN c.user.id = :userId THEN c.connectedUser.id ELSE c.user.id END " + 
           "FROM UserConnection c " + 
           "WHERE (c.user.id = :userId OR c.connectedUser.id = :userId) AND c.status = 'ACCEPTED'")
    List<Integer> findConnectedUserIds(@Param("userId") Integer userId);
} 