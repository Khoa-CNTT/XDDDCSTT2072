package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.AgriculturalAdvice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IAgriculturalAdviceRepository extends JpaRepository<AgriculturalAdvice, Integer> {
    
    List<AgriculturalAdvice> findByWeatherDataId(Integer weatherDataId);
    
    @Query("SELECT a FROM AgriculturalAdvice a WHERE a.weatherData.city = :city AND a.weatherData.country = :country ORDER BY a.createdAt DESC")
    List<AgriculturalAdvice> findByLocation(String city, String country);
    
    @Query("SELECT a FROM AgriculturalAdvice a WHERE a.weatherData.city = :city AND a.weatherData.country = :country ORDER BY a.createdAt DESC LIMIT 1")
    Optional<AgriculturalAdvice> findLatestByLocation(String city, String country);
    
    List<AgriculturalAdvice> findByIsSuitableForPlantingTrueOrderByCreatedAtDesc();
    
    List<AgriculturalAdvice> findByIsSuitableForHarvestingTrueOrderByCreatedAtDesc();
} 