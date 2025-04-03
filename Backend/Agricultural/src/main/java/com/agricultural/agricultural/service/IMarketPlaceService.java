package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IMarketPlaceService {
    MarketPlaceDTO createProduct(MarketPlaceDTO productDTO);
    MarketPlaceDTO updateProduct(Integer id, MarketPlaceDTO productDTO);
    void deleteProduct(Integer id);
    MarketPlaceDTO getProduct(Integer id);
    Page<MarketPlaceDTO> getAllProducts(Pageable pageable);
//    Page<MarketPlaceDTO> getProductsByUser(Integer userId, Pageable pageable);
    Page<MarketPlaceDTO> searchProducts(String keyword, Pageable pageable);
    Page<MarketPlaceDTO> getAvailableProducts(Pageable pageable);
} 