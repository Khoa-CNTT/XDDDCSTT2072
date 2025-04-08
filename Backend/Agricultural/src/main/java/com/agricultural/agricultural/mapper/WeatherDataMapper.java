package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.entity.WeatherData;
import org.springframework.stereotype.Component;

@Component
public class WeatherDataMapper {
    
    public WeatherDataDTO toDTO(WeatherData entity) {
        if (entity == null) {
            return null;
        }
        
        WeatherDataDTO dto = new WeatherDataDTO();
        dto.setId(entity.getId());
        dto.setCity(entity.getCity());
        dto.setCountry(entity.getCountry());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setTemperature(entity.getTemperature());
        dto.setHumidity(entity.getHumidity());
        dto.setWindSpeed(entity.getWindSpeed());
        dto.setWeatherDescription(entity.getWeatherDescription());
        dto.setIconCode(entity.getIconCode());
        dto.setRequestTime(entity.getRequestTime());
        dto.setDataTime(entity.getDataTime());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
    
    public WeatherData toEntity(WeatherDataDTO dto) {
        if (dto == null) {
            return null;
        }
        
        WeatherData entity = new WeatherData();
        entity.setId(dto.getId());
        entity.setCity(dto.getCity());
        entity.setCountry(dto.getCountry());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setTemperature(dto.getTemperature());
        entity.setHumidity(dto.getHumidity());
        entity.setWindSpeed(dto.getWindSpeed());
        entity.setWeatherDescription(dto.getWeatherDescription());
        entity.setIconCode(dto.getIconCode());
        entity.setRequestTime(dto.getRequestTime());
        entity.setDataTime(dto.getDataTime());
        
        return entity;
    }
} 