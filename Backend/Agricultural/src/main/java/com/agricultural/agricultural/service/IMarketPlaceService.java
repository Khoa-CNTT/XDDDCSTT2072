package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
        String sortBy,
        Pageable pageable
    );
    Page<MarketPlaceDTO> getProductsByUser(Integer userId, Pageable pageable);
    

    MarketPlaceDTO createProductWithImage(String productName, String description, String shortDescription, Integer quantity, 
                                        BigDecimal price, BigDecimal salePrice, LocalDateTime saleStartDate, 
                                        LocalDateTime saleEndDate, Integer categoryId, String sku, Double weight, 
                                        String dimensions, MultipartFile imageFile) throws IOException;
    

    MarketPlaceDTO updateProduct(Integer id, String productName, String description, String shortDescription, 
                               Integer quantity, BigDecimal price, BigDecimal salePrice, LocalDateTime saleStartDate, 
                               LocalDateTime saleEndDate, Integer categoryId, String sku, Double weight, 
                               String dimensions, MultipartFile imageFile) throws IOException;


    List<MarketPlaceDTO> refreshAllStockStatus();


    List<MarketPlaceDTO> refreshAllProducts();


    MarketPlaceDTO updateProductWithImage(Integer id, MarketPlaceDTO productDTO) throws IOException;
} 