package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.SubscriptionPlanDTO;
import com.agricultural.agricultural.entity.SubscriptionPlan;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SubscriptionPlanMapper {
    
    public SubscriptionPlanDTO toDTO(SubscriptionPlan entity) {
        if (entity == null) {
            return null;
        }
        
        return SubscriptionPlanDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .durationMonths(entity.getDurationMonths())
                .maxLocations(entity.getMaxLocations())
                .isActive(entity.getIsActive())
                .isFree(entity.getIsFree())
                .canSellProducts(entity.getCanSellProducts())
                .canAccessForum(entity.getCanAccessForum())
                .canPurchaseProducts(entity.getCanPurchaseProducts())
                .canUseAIChat(entity.getCanUseAIChat())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    public SubscriptionPlan toEntity(SubscriptionPlanDTO dto) {
        if (dto == null) {
            return null;
        }
        
        SubscriptionPlan entity = SubscriptionPlan.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .durationMonths(dto.getDurationMonths())
                .maxLocations(dto.getMaxLocations())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .isFree(dto.getIsFree() != null ? dto.getIsFree() : false)
                .build();
        
        // Thiết lập các quyền với giá trị mặc định nếu chưa có
        entity.setCanSellProducts(dto.getCanSellProducts() != null ? dto.getCanSellProducts() : false);
        entity.setCanAccessForum(dto.getCanAccessForum() != null ? dto.getCanAccessForum() : true);
        entity.setCanPurchaseProducts(dto.getCanPurchaseProducts() != null ? dto.getCanPurchaseProducts() : true);
        entity.setCanUseAIChat(dto.getCanUseAIChat() != null ? dto.getCanUseAIChat() : true);
        
        return entity;
    }
    
    public List<SubscriptionPlanDTO> toDTOList(List<SubscriptionPlan> entities) {
        if (entities == null) {
            return null;
        }
        
        List<SubscriptionPlanDTO> dtoList = new ArrayList<>();
        for (SubscriptionPlan entity : entities) {
            dtoList.add(toDTO(entity));
        }
        
        return dtoList;
    }
} 