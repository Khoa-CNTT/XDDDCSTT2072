package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;
import com.agricultural.agricultural.entity.AgriculturalAdvice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WeatherDataMapper.class})
public interface AgriculturalAdviceMapper {
    
    @Mapping(source = "weatherData", target = "weatherData")
    AgriculturalAdviceDTO toDTO(AgriculturalAdvice entity);
    
    @Mapping(target = "weatherData", ignore = true)
    AgriculturalAdvice toEntity(AgriculturalAdviceDTO dto);
} 