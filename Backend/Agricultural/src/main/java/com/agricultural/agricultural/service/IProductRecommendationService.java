package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface IProductRecommendationService {


    Page<MarketPlaceDTO> getPersonalizedRecommendations(Integer userId, Pageable pageable);
    

    Page<MarketPlaceDTO> getSimilarProducts(Integer marketplaceId, Pageable pageable);
    

    List<MarketPlaceDTO> getFrequentlyBoughtTogether(Integer marketplaceId, int limit);
    

    Page<MarketPlaceDTO> getTrendingProducts(Pageable pageable);
    

    void updateRecommendationModels();
    
    void recordProductView(Integer userId, Integer marketplaceId);


    Page<MarketPlaceDTO> getSeasonalProducts(Pageable pageable);


    Page<MarketPlaceDTO> getUpcomingSeasonalProducts(Pageable pageable);
} 