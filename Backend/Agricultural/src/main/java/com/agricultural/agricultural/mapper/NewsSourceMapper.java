package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.NewsSourceDTO;
import com.agricultural.agricultural.entity.NewsSource;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NewsSourceMapper {
    
    NewsSourceMapper INSTANCE = Mappers.getMapper(NewsSourceMapper.class);
    
    NewsSourceDTO toDTO(NewsSource newsSource);
    
    NewsSource toEntity(NewsSourceDTO newsSourceDTO);
    
    List<NewsSourceDTO> toDTOList(List<NewsSource> newsSourceList);
} 