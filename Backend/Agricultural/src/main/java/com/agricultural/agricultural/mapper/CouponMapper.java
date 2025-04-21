package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.request.CouponRequest;
import com.agricultural.agricultural.dto.response.CouponDTO;
import com.agricultural.agricultural.entity.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, 
    imports = {LocalDateTime.class, ChronoUnit.class})
public interface CouponMapper {
    
    CouponMapper INSTANCE = Mappers.getMapper(CouponMapper.class);
    
    @Mapping(target = "isValid", expression = "java(coupon.isValid())")
    @Mapping(target = "isExpired", expression = "java(java.time.LocalDateTime.now().isAfter(coupon.getEndDate()))")
    @Mapping(target = "daysLeft", expression = "java(calculateDaysLeft(coupon.getEndDate()))")
    CouponDTO toDTO(Coupon coupon);
    
    List<CouponDTO> toDTOList(List<Coupon> coupons);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", constant = "active")
    @Mapping(target = "usageCount", constant = "0")
    Coupon toEntity(CouponRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "usageCount", ignore = true)
    void updateFromRequest(CouponRequest request, @MappingTarget Coupon coupon);
    
    default Long calculateDaysLeft(LocalDateTime endDate) {
        if (endDate == null || LocalDateTime.now().isAfter(endDate)) {
            return 0L;
        }
        return ChronoUnit.DAYS.between(LocalDateTime.now(), endDate);
    }
} 