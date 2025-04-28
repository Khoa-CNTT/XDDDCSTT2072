package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.NotificationDTO;
import com.agricultural.agricultural.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);
    
    NotificationDTO toDTO(Notification notification);
    
    Notification toEntity(NotificationDTO dto);
    
    List<NotificationDTO> toDTOList(List<Notification> notifications);
} 