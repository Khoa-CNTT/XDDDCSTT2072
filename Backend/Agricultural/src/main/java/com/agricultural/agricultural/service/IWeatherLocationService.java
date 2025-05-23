package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.WeatherMonitoredLocationDTO;
import java.util.List;
import java.util.Optional;

public interface IWeatherLocationService {
    

    List<WeatherMonitoredLocationDTO> getAllLocations();
    

    List<WeatherMonitoredLocationDTO> getActiveLocations();
    

    Optional<WeatherMonitoredLocationDTO> getLocationById(Integer id);

    Optional<WeatherMonitoredLocationDTO> getLocationByCityAndCountry(String city, String country);
    

    List<WeatherMonitoredLocationDTO> searchLocationsByName(String keyword);
    

    List<WeatherMonitoredLocationDTO> searchLocationsByCity(String keyword);
    

    WeatherMonitoredLocationDTO saveLocation(WeatherMonitoredLocationDTO locationDTO);
    

    WeatherMonitoredLocationDTO updateLocationStatus(Integer id, Boolean isActive);

    void deleteLocation(Integer id);
} 