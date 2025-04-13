package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.ProductCategoryDTO;
import com.agricultural.agricultural.entity.ProductCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductCategoryMapper {
    ProductCategoryMapper INSTANCE = Mappers.getMapper(ProductCategoryMapper.class);

    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "parent.name", target = "parentName")
    @Mapping(target = "productCount", ignore = true)
    @Mapping(target = "children", ignore = true)
    ProductCategoryDTO toDTO(ProductCategory category);

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ProductCategory toEntity(ProductCategoryDTO categoryDTO);

    List<ProductCategoryDTO> toDTOList(List<ProductCategory> categories);
    
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateCategoryFromDTO(ProductCategoryDTO dto, @MappingTarget ProductCategory entity);
} 