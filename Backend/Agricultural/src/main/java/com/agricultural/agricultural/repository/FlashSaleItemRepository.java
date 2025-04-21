package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.FlashSale;
import com.agricultural.agricultural.entity.FlashSaleItem;
import com.agricultural.agricultural.entity.MarketPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, Integer> {
    
    /**
     * Tìm danh sách items của một flash sale
     */
    List<FlashSaleItem> findByFlashSale(FlashSale flashSale);
    
    List<FlashSaleItem> findByFlashSaleId(Integer flashSaleId);
    
    /**
     * Tìm flash sale item theo flash sale và product
     */
    Optional<FlashSaleItem> findByFlashSaleAndProduct(FlashSale flashSale, MarketPlace product);
    
    /**
     * Tìm flash sale item theo flash sale ID và product ID
     */
    @Query("SELECT i FROM FlashSaleItem i WHERE i.flashSale.id = :flashSaleId AND i.product.id = :productId")
    Optional<FlashSaleItem> findByFlashSaleIdAndProductId(@Param("flashSaleId") Integer flashSaleId, @Param("productId") Integer productId);
    
    /**
     * Kiểm tra sản phẩm có nằm trong flash sale đang hoạt động không
     */
    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END " +
           "FROM FlashSaleItem i " +
           "WHERE i.product.id = :productId " +
           "AND i.flashSale.status = 'ACTIVE' " +
           "AND i.flashSale.startTime <= CURRENT_TIMESTAMP " +
           "AND i.flashSale.endTime >= CURRENT_TIMESTAMP " +
           "AND i.stockQuantity > i.soldQuantity")
    boolean isProductInActiveFlashSale(@Param("productId") Integer productId);
    
    /**
     * Tìm flash sale item của sản phẩm trong flash sale đang hoạt động
     */
    @Query("SELECT i FROM FlashSaleItem i " +
           "WHERE i.product.id = :productId " +
           "AND i.flashSale.status = 'ACTIVE' " +
           "AND i.flashSale.startTime <= CURRENT_TIMESTAMP " +
           "AND i.flashSale.endTime >= CURRENT_TIMESTAMP")
    Optional<FlashSaleItem> findActiveFlashSaleItemByProductId(@Param("productId") Integer productId);
    
    @Query("SELECT COUNT(fsi) FROM FlashSaleItem fsi WHERE fsi.flashSale.id = :flashSaleId")
    long countByFlashSaleId(Integer flashSaleId);
} 