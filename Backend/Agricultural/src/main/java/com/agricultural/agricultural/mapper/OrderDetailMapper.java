package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {
    OrderDetailMapper INSTANCE = Mappers.getMapper(OrderDetailMapper.class);

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.imageUrl", target = "productImage")
    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(source = "variant.name", target = "variantName")
    OrderDetailDTO toDto(OrderDetail orderDetail);

    List<OrderDetailDTO> toDtoList(List<OrderDetail> orderDetails);

    @Mapping(target = "order", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variant", ignore = true)
    OrderDetail toEntity(OrderDetailDTO orderDetailDTO);

    void updateEntityFromDto(OrderDetailDTO dto, @MappingTarget OrderDetail entity);
} 