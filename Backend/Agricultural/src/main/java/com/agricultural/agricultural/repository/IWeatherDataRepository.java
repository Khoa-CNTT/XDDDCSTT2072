package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.WeatherData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IWeatherDataRepository extends JpaRepository<WeatherData, Integer> {
    
    List<WeatherData> findByCityIgnoreCaseAndCountryIgnoreCase(String city, String country);
    
    Optional<WeatherData> findFirstByCityIgnoreCaseAndCountryIgnoreCaseOrderByDataTimeDesc(String city, String country);
    
    @Query("SELECT w FROM WeatherData w WHERE w.city = :city AND w.country = :country AND w.dataTime >= :startTime")
    List<WeatherData> findRecentWeatherData(String city, String country, LocalDateTime startTime);
    
    @Query("SELECT DISTINCT w.city FROM WeatherData w WHERE LOWER(w.city) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<String> findDistinctCitiesByKeyword(String keyword);
    
    List<WeatherData> findByLatitudeAndLongitude(Double latitude, Double longitude);
    
    Optional<WeatherData> findFirstByLatitudeAndLongitudeOrderByDataTimeDesc(Double latitude, Double longitude);
} 