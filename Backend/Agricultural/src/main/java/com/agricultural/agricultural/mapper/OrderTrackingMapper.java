package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderTrackingDTO;
import com.agricultural.agricultural.entity.OrderTracking;
import org.springframework.stereotype.Component;

@Component
public class OrderTrackingMapper {

    public OrderTrackingDTO toDTO(OrderTracking entity) {
        if (entity == null) {
            return null;
        }
        
        return OrderTrackingDTO.builder()
                .id(entity.getId())
                .orderId(entity.getOrderId())
                .status(entity.getStatus())
                .description(entity.getDescription())
                .timestamp(entity.getTimestamp())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }

    public OrderTracking toEntity(OrderTrackingDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return OrderTracking.builder()
                .id(dto.getId())
                .orderId(dto.getOrderId())
                .status(dto.getStatus())
                .description(dto.getDescription())
                .timestamp(dto.getTimestamp())
                .updatedBy(dto.getUpdatedBy())
                .build();
    }
} 