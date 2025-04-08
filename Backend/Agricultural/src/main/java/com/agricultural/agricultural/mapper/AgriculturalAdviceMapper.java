package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;
import com.agricultural.agricultural.entity.AgriculturalAdvice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AgriculturalAdviceMapper {
    
    private final WeatherDataMapper weatherDataMapper;
    
    @Autowired
    public AgriculturalAdviceMapper(WeatherDataMapper weatherDataMapper) {
        this.weatherDataMapper = weatherDataMapper;
    }
    
    public AgriculturalAdviceDTO toDTO(AgriculturalAdvice entity) {
        if (entity == null) {
            return null;
        }
        
        AgriculturalAdviceDTO dto = new AgriculturalAdviceDTO();
        dto.setId(entity.getId());
        dto.setWeatherData(weatherDataMapper.toDTO(entity.getWeatherData()));
        dto.setWeatherSummary(entity.getWeatherSummary());
        dto.setFarmingAdvice(entity.getFarmingAdvice());
        dto.setCropAdvice(entity.getCropAdvice());
        dto.setWarnings(entity.getWarnings());
        dto.setIsRainySeason(entity.getIsRainySeason());
        dto.setIsDrySeason(entity.getIsDrySeason());
        dto.setIsSuitableForPlanting(entity.getIsSuitableForPlanting());
        dto.setIsSuitableForHarvesting(entity.getIsSuitableForHarvesting());
        dto.setRecommendedActivities(entity.getRecommendedActivities());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
    
    public AgriculturalAdvice toEntity(AgriculturalAdviceDTO dto) {
        if (dto == null) {
            return null;
        }
        
        AgriculturalAdvice entity = new AgriculturalAdvice();
        entity.setId(dto.getId());
        // WeatherData relationship is handled separately
        entity.setWeatherSummary(dto.getWeatherSummary());
        entity.setFarmingAdvice(dto.getFarmingAdvice());
        entity.setCropAdvice(dto.getCropAdvice());
        entity.setWarnings(dto.getWarnings());
        entity.setIsRainySeason(dto.getIsRainySeason());
        entity.setIsDrySeason(dto.getIsDrySeason());
        entity.setIsSuitableForPlanting(dto.getIsSuitableForPlanting());
        entity.setIsSuitableForHarvesting(dto.getIsSuitableForHarvesting());
        entity.setRecommendedActivities(dto.getRecommendedActivities());
        
        return entity;
    }
} 