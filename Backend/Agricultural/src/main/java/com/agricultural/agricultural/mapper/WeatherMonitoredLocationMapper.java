package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.WeatherMonitoredLocationDTO;
import com.agricultural.agricultural.entity.WeatherMonitoredLocation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WeatherMonitoredLocationMapper {
    WeatherMonitoredLocationDTO toDTO(WeatherMonitoredLocation entity);
    WeatherMonitoredLocation toEntity(WeatherMonitoredLocationDTO dto);
} 