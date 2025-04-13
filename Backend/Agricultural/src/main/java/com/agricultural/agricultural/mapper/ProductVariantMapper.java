package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.ProductVariantDTO;
import com.agricultural.agricultural.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    ProductVariantMapper INSTANCE = Mappers.getMapper(ProductVariantMapper.class);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(expression = "java(variant.getFinalPrice())", target = "finalPrice")
    ProductVariantDTO toDTO(ProductVariant variant);

    @Mapping(target = "product", ignore = true)
    ProductVariant toEntity(ProductVariantDTO variantDTO);

    List<ProductVariantDTO> toDTOList(List<ProductVariant> variants);
    
    @Mapping(target = "product", ignore = true)
    void updateVariantFromDTO(ProductVariantDTO dto, @MappingTarget ProductVariant entity);
} 