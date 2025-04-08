package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.WeatherMonitoredLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IWeatherMonitoredLocationRepository extends JpaRepository<WeatherMonitoredLocation, Integer> {
    
    List<WeatherMonitoredLocation> findByIsActiveTrue();
    
    Optional<WeatherMonitoredLocation> findByCityIgnoreCaseAndCountryIgnoreCase(String city, String country);
    
    @Query("SELECT l FROM WeatherMonitoredLocation l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<WeatherMonitoredLocation> searchByName(String keyword);
    
    @Query("SELECT l FROM WeatherMonitoredLocation l WHERE LOWER(l.city) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<WeatherMonitoredLocation> searchByCity(String keyword);
} 