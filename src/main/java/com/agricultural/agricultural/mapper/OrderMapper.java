package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderDTO;
import com.agricultural.agricultural.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {OrderDetailMapper.class})
public interface OrderMapper {
    @Mapping(source = "buyer.username", target = "buyerName")
    @Mapping(source = "seller.username", target = "sellerName")
    @Mapping(source = "orderDetails", target = "orderDetails")
    OrderDTO toDTO(Order order);

    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "orderDetails", ignore = true)
    Order toEntity(OrderDTO orderDTO);
} 