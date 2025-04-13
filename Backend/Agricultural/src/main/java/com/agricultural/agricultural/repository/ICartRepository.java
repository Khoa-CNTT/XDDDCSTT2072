package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ICartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findByUserIdAndDeletedFalse(Integer userId);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.user.id = :userId AND c.deleted = false")
    Optional<Cart> findByUserIdWithCartItems(@Param("userId") Integer userId);

    boolean existsByUserIdAndDeletedFalse(Integer userId);
} 