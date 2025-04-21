package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderDTO;
import com.agricultural.agricultural.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OrderDetailMapper.class})
public interface OrderMapper {
    OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);
    
    @Mapping(source = "buyer.username", target = "buyerName")
    @Mapping(source = "seller.username", target = "sellerName")
    @Mapping(source = "orderDetails", target = "orderDetails")
    OrderDTO toDTO(Order order);
    
    List<OrderDTO> toDTOList(List<Order> orders);

    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "orderDetails", ignore = true)
    @Mapping(target = "orderTrackings", ignore = true)
    Order toEntity(OrderDTO orderDTO);
    
    void updateEntityFromDto(OrderDTO dto, @MappingTarget Order entity);
} 