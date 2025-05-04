package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.UserSubscriptionDTO;
import com.agricultural.agricultural.entity.SubscriptionPlan;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.UserSubscription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserSubscriptionMapper {
    
    public UserSubscriptionDTO toDTO(UserSubscription entity) {
        if (entity == null) {
            return null;
        }
        
        User user = entity.getUser();
        SubscriptionPlan plan = entity.getPlan();
        
        LocalDateTime now = LocalDateTime.now();
        boolean isExpired = now.isAfter(entity.getEndDate());
        long daysRemaining = isExpired ? 0 : ChronoUnit.DAYS.between(now, entity.getEndDate());
        
        return UserSubscriptionDTO.builder()
                .id(entity.getId())
                .userId(user != null ? user.getId() : null)
                .planId(plan != null ? plan.getId() : null)
                .planName(plan != null ? plan.getName() : null)
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .paymentAmount(entity.getPaymentAmount())
                .paymentStatus(entity.getPaymentStatus())
                .transactionId(entity.getTransactionId())
                .isActive(entity.getIsActive())
                .isAutoRenew(entity.getIsAutoRenew())
                .maxLocations(plan != null ? plan.getMaxLocations() : 0)
                .locationsUsed(entity.getLocationsUsed())
                .remainingLocations(plan != null ? plan.getMaxLocations() - entity.getLocationsUsed() : 0)
                .userName(user != null ? user.getUsername() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .daysRemaining(daysRemaining)
                .isExpired(isExpired)
                .build();
    }
    
    public List<UserSubscriptionDTO> toDTOList(List<UserSubscription> entities) {
        if (entities == null) {
            return null;
        }
        
        List<UserSubscriptionDTO> dtoList = new ArrayList<>();
        for (UserSubscription entity : entities) {
            dtoList.add(toDTO(entity));
        }
        
        return dtoList;
    }
} 