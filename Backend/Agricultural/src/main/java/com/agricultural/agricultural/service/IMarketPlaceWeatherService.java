package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.SeasonalRecommendationDTO;
import com.agricultural.agricultural.dto.WeatherDataDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;


public interface IMarketPlaceWeatherService {


    List<MarketPlaceDTO> getProductsForCurrentWeather(String city, String country);
    

    Page<MarketPlaceDTO> getProductsForRainySeason(Pageable pageable);
    

    Page<MarketPlaceDTO> getProductsForDrySeason(Pageable pageable);
    

    List<MarketPlaceDTO> getProductsForPlanting(String city, String country);
    

    List<MarketPlaceDTO> getProductsForHarvesting(String city, String country);
    

    Map<String, Object> getSeasonalPromotions(String city, String country);
    

    List<SeasonalRecommendationDTO> getDetailedRecommendations(String city, String country);


    Page<MarketPlaceDTO> getProductsByCropAndWeather(String cropType, WeatherDataDTO weatherData, Pageable pageable);
    

    Map<String, Object> predictExtremeWeather(String city, String country, int forecastDays);
    

    Map<String, List<MarketPlaceDTO>> getProductsForExtremeWeather(Map<String, Object> extremeWeather);
    

    List<String> getExtremeWeatherAdvice(Map<String, Object> extremeWeather);
    

    Map<String, Object> analyzeProductPerformanceByWeather(Integer productId, String region, int period);
    

    List<String> getProductOptimizationTips(Integer productId, Map<String, Object> performanceData);
    

    Map<String, Object> predictFutureProductPerformance(Integer productId, String region);
} 