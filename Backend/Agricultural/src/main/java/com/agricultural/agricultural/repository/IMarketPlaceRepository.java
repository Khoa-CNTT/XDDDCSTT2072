package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.MarketPlace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IMarketPlaceRepository extends JpaRepository<MarketPlace, Integer> {
    
    Page<MarketPlace> findByUserId(Integer userId, Pageable pageable);
    
    @Query("SELECT m FROM MarketPlace m WHERE LOWER(m.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<MarketPlace> searchByProductName(String keyword, Pageable pageable);

    @Query("SELECT m FROM MarketPlace m WHERE m.quantity > 0")
    Page<MarketPlace> findAvailableProducts(Pageable pageable);
    
    List<MarketPlace> findByQuantityGreaterThan(Integer quantity);
    
    // Tìm sản phẩm đang giảm giá
    @Query("SELECT m FROM MarketPlace m WHERE m.salePrice IS NOT NULL " +
           "AND m.saleStartDate IS NOT NULL AND m.saleEndDate IS NOT NULL " +
           "AND m.salePrice < m.price " +
           "AND :now BETWEEN m.saleStartDate AND m.saleEndDate")
    Page<MarketPlace> findOnSaleProducts(@Param("now") LocalDateTime now, Pageable pageable);
    
    // Tìm sản phẩm theo danh mục
    Page<MarketPlace> findByCategoryId(Integer categoryId, Pageable pageable);
    
    // Tìm sản phẩm trong khoảng giá
    @Query("SELECT m FROM MarketPlace m WHERE " +
           "CASE WHEN m.salePrice IS NOT NULL " +
           "AND :now BETWEEN m.saleStartDate AND m.saleEndDate " +
           "AND m.salePrice < m.price THEN m.salePrice ELSE m.price END " +
           "BETWEEN :minPrice AND :maxPrice")
    Page<MarketPlace> findByPriceRange(
        @Param("minPrice") BigDecimal minPrice, 
        @Param("maxPrice") BigDecimal maxPrice, 
        @Param("now") LocalDateTime now,
        Pageable pageable
    );
    
    // Tìm sản phẩm có xếp hạng cao
    @Query("SELECT m FROM MarketPlace m WHERE m.averageRating >= :minRating")
    Page<MarketPlace> findByMinimumRating(@Param("minRating") BigDecimal minRating, Pageable pageable);
    
    // Tìm sản phẩm phổ biến (dựa trên số lượt mua)
    @Query("SELECT m FROM MarketPlace m ORDER BY m.purchaseCount DESC")
    Page<MarketPlace> findPopularProducts(Pageable pageable);
    
    // Tìm sản phẩm vừa cập nhật
    @Query("SELECT m FROM MarketPlace m ORDER BY m.updatedAt DESC")
    Page<MarketPlace> findRecentlyUpdatedProducts(Pageable pageable);
    
    // Tìm kiếm sản phẩm nâng cao
    @Query("SELECT m FROM MarketPlace m WHERE " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR CASE WHEN m.salePrice IS NOT NULL " +
           "AND :now BETWEEN m.saleStartDate AND m.saleEndDate " +
           "AND m.salePrice < m.price THEN m.salePrice ELSE m.price END >= :minPrice) AND " +
           "(:maxPrice IS NULL OR CASE WHEN m.salePrice IS NOT NULL " +
           "AND :now BETWEEN m.saleStartDate AND m.saleEndDate " +
           "AND m.salePrice < m.price THEN m.salePrice ELSE m.price END <= :maxPrice) AND " +
           "(:keyword IS NULL OR LOWER(m.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:onSaleOnly = false OR (m.salePrice IS NOT NULL " +
           "AND m.saleStartDate IS NOT NULL AND m.saleEndDate IS NOT NULL " +
           "AND m.salePrice < m.price " +
           "AND :now BETWEEN m.saleStartDate AND m.saleEndDate))")
    Page<MarketPlace> advancedSearch(
        @Param("categoryId") Integer categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("keyword") String keyword,
        @Param("onSaleOnly") boolean onSaleOnly,
        @Param("now") LocalDateTime now,
        Pageable pageable
    );
} 