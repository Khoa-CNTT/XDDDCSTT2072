package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderTrackingDTO;
import com.agricultural.agricultural.entity.OrderTracking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderTrackingMapper {
    OrderTrackingDTO toDTO(OrderTracking entity);
    OrderTracking toEntity(OrderTrackingDTO dto);
} 