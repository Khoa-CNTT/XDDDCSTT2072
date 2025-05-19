package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IWishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findByUserId(Integer userId);
    
    Optional<Wishlist> findByUserIdAndIsDefaultTrue(Integer userId);
    
    Optional<Wishlist> findByIdAndUserId(Integer id, Integer userId);
    
    boolean existsByUserIdAndIsDefaultTrue(Integer userId);
    
    boolean existsByUserIdAndNameAndIdNot(Integer userId, String name, Integer id);
} 