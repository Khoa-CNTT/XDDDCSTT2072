package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.HashtagDTO;
import com.agricultural.agricultural.entity.Hashtag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HashtagMapper {
    
    HashtagMapper INSTANCE = Mappers.getMapper(HashtagMapper.class);
    
    @Mapping(target = "posts", ignore = true)
    Hashtag toEntity(HashtagDTO dto);
    
    HashtagDTO toDTO(Hashtag entity);
}