package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICartItemRepository extends JpaRepository<CartItem, Integer> {

    List<CartItem> findByCartId(Integer cartId);
    

    Optional<CartItem> findByCartIdAndProductId(Integer cartId, Integer productId);
    

    Optional<CartItem> findByCartIdAndProductIdAndVariantId(Integer cartId, Integer productId, Integer variantId);
    

    void deleteByCartId(Integer cartId);
    

    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.id = :cartId")
    int countByCartId(@Param("cartId") Integer cartId);
} 