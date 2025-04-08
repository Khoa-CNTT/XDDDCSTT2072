package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.UserWeatherSubscriptionDTO;
import com.agricultural.agricultural.entity.UserWeatherSubscription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserWeatherSubscriptionMapper {
    
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userName")
    @Mapping(source = "location.id", target = "locationId")
    @Mapping(source = "location.name", target = "locationName")
    @Mapping(source = "location.city", target = "city")
    @Mapping(source = "location.country", target = "country")
    UserWeatherSubscriptionDTO toDTO(UserWeatherSubscription entity);
    
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "location", ignore = true)
    UserWeatherSubscription toEntity(UserWeatherSubscriptionDTO dto);
} 