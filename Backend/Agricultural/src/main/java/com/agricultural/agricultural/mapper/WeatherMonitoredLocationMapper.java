package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.WeatherMonitoredLocationDTO;
import com.agricultural.agricultural.entity.WeatherMonitoredLocation;
import org.springframework.stereotype.Component;

@Component
public class WeatherMonitoredLocationMapper {
    
    public WeatherMonitoredLocationDTO toDTO(WeatherMonitoredLocation entity) {
        if (entity == null) {
            return null;
        }
        
        WeatherMonitoredLocationDTO dto = new WeatherMonitoredLocationDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCity(entity.getCity());
        dto.setCountry(entity.getCountry());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setIsActive(entity.getIsActive());
        dto.setMonitoringFrequency(entity.getMonitoringFrequency());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
    
    public WeatherMonitoredLocation toEntity(WeatherMonitoredLocationDTO dto) {
        if (dto == null) {
            return null;
        }
        
        WeatherMonitoredLocation entity = new WeatherMonitoredLocation();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setCity(dto.getCity());
        entity.setCountry(dto.getCountry());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setIsActive(dto.getIsActive());
        entity.setMonitoringFrequency(dto.getMonitoringFrequency());
        
        return entity;
    }
} 