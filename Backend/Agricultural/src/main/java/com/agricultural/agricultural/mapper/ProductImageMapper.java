package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.ProductImageDTO;
import com.agricultural.agricultural.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    
    ProductImageMapper INSTANCE = Mappers.getMapper(ProductImageMapper.class);
    
    @Mapping(source = "product.id", target = "productId")
    ProductImageDTO toDTO(ProductImage productImage);
    
    List<ProductImageDTO> toDTOList(List<ProductImage> productImages);
    
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ProductImage toEntity(ProductImageDTO productImageDTO);
    
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDTO(ProductImageDTO dto, @MappingTarget ProductImage entity);
} 