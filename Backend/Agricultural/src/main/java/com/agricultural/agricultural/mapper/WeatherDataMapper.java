package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.entity.WeatherData;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WeatherDataMapper {
    
    // Map trực tiếp các thuộc tính từ entity sang DTO
    WeatherDataDTO toDTO(WeatherData entity);
    
    // Map từ DTO sang entity
    WeatherData toEntity(WeatherDataDTO dto);
} 