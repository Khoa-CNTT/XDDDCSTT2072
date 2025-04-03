package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(target = "subtotal", expression = "java(orderDetail.getPrice().multiply(new java.math.BigDecimal(orderDetail.getQuantity())))")
    OrderDetailDTO toDTO(OrderDetail orderDetail);

    @Mapping(target = "order", ignore = true)
    @Mapping(target = "product", ignore = true)
    OrderDetail toEntity(OrderDetailDTO orderDetailDTO);
} 