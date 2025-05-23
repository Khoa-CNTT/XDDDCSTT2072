package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface IWeatherService {

    WeatherDataDTO getCurrentWeather(String city, String country);
    

    List<WeatherDataDTO> getWeatherHistory(String city, String country, LocalDateTime startTime);

    WeatherDataDTO getCurrentWeatherByCoordinates(Double latitude, Double longitude);
    

    List<String> searchCities(String keyword);
    

    Optional<AgriculturalAdviceDTO> getLatestAgriculturalAdvice(String city, String country);
    

    List<AgriculturalAdviceDTO> getAgriculturalAdviceHistory(String city, String country);

    List<AgriculturalAdviceDTO> getPlantingAdvice();
    

    List<AgriculturalAdviceDTO> getHarvestingAdvice();
    


    List<WeatherDataDTO> getWeatherForecast(String city, String country, int days);
    

    Map<String, Object> predictExtremeWeather(String city, String country, int forecastDays);
} 