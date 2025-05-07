package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.NewsDTO;
import com.agricultural.agricultural.entity.News;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NewsMapper {
    
    NewsMapper INSTANCE = Mappers.getMapper(NewsMapper.class);
    
    NewsDTO toDTO(News news);
    
    News toEntity(NewsDTO newsDTO);
    
    List<NewsDTO> toDTOList(List<News> newsList);
} 