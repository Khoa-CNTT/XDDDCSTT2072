package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.UserWeatherSubscriptionDTO;
import com.agricultural.agricultural.entity.UserWeatherSubscription;
import org.springframework.stereotype.Component;

@Component
public class UserWeatherSubscriptionMapper {
    
    public UserWeatherSubscriptionDTO toDTO(UserWeatherSubscription entity) {
        if (entity == null) {
            return null;
        }
        
        UserWeatherSubscriptionDTO dto = new UserWeatherSubscriptionDTO();
        dto.setId(Math.toIntExact(entity.getId()));
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getUsername());
        dto.setLocationId((int) entity.getLocation().getId().longValue());
        dto.setLocationName(entity.getLocation().getName());
        dto.setCity(entity.getLocation().getCity());
        dto.setCountry(entity.getLocation().getCountry());
        dto.setEnableNotifications(entity.getEnableNotifications());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
    
    public UserWeatherSubscription toEntity(UserWeatherSubscriptionDTO dto) {
        // This method is typically not needed for this use case
        // as we create entities from direct parameters, not from DTOs
        throw new UnsupportedOperationException("Converting DTO to entity is not supported for UserWeatherSubscription");
    }
} 