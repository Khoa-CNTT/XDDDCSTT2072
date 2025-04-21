package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderTrackingDTO;
import com.agricultural.agricultural.entity.OrderTracking;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderTrackingMapper {
    OrderTrackingMapper INSTANCE = Mappers.getMapper(OrderTrackingMapper.class);

    OrderTrackingDTO toDTO(OrderTracking entity);
    
    List<OrderTrackingDTO> toDTOList(List<OrderTracking> entities);
    
    OrderTracking toEntity(OrderTrackingDTO dto);
    
    void updateEntityFromDTO(OrderTrackingDTO dto, @MappingTarget OrderTracking entity);
} 