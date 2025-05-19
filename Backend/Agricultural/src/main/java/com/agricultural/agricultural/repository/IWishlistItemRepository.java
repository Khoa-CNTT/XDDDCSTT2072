package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IWishlistItemRepository extends JpaRepository<WishlistItem, Integer> {
    List<WishlistItem> findByWishlistId(Integer wishlistId);
    
    Optional<WishlistItem> findByWishlistIdAndProductId(Integer wishlistId, Integer productId);
    
    Optional<WishlistItem> findByWishlistIdAndProductIdAndVariantId(Integer wishlistId, Integer productId, Integer variantId);
    
    boolean existsByWishlistIdAndProductId(Integer wishlistId, Integer productId);
    
    void deleteByWishlistIdAndProductId(Integer wishlistId, Integer productId);
    
    @Query("SELECT COUNT(wi) FROM WishlistItem wi WHERE wi.wishlist.id = :wishlistId")
    Integer countItemsByWishlistId(@Param("wishlistId") Integer wishlistId);
    
    @Query("SELECT wi FROM WishlistItem wi JOIN FETCH wi.product WHERE wi.wishlist.id = :wishlistId")
    List<WishlistItem> findByWishlistIdWithProducts(@Param("wishlistId") Integer wishlistId);
} 