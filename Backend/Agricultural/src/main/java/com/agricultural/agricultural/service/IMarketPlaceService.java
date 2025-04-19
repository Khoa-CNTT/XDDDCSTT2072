package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface IMarketPlaceService {
    MarketPlaceDTO createProduct(MarketPlaceDTO productDTO);
    MarketPlaceDTO updateProduct(Integer id, MarketPlaceDTO productDTO);
    void deleteProduct(Integer id);
    MarketPlaceDTO getProduct(Integer id);
    Page<MarketPlaceDTO> getAllProducts(Pageable pageable);
    Page<MarketPlaceDTO> searchProducts(String keyword, Pageable pageable);
    Page<MarketPlaceDTO> getAvailableProducts(Pageable pageable);
    Page<MarketPlaceDTO> getProductsByCategory(Integer categoryId, Pageable pageable);
    Page<MarketPlaceDTO> getOnSaleProducts(Pageable pageable);
    Page<MarketPlaceDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    Page<MarketPlaceDTO> getProductsByMinimumRating(BigDecimal minRating, Pageable pageable);
    Page<MarketPlaceDTO> getPopularProducts(Pageable pageable);
    Page<MarketPlaceDTO> getRecentlyUpdatedProducts(Pageable pageable);
    Page<MarketPlaceDTO> advancedSearch(
        Integer categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String keyword,
        boolean onSaleOnly,
        Pageable pageable
    );
    Page<MarketPlaceDTO> getProductsByUser(Integer userId, Pageable pageable);
} 