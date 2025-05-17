package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.SellerRegistrationDTO;
import com.agricultural.agricultural.entity.SellerRegistration;
import com.agricultural.agricultural.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class SellerRegistrationMapper {
    
    public SellerRegistrationDTO toDTO(SellerRegistration entity) {
        if (entity == null) {
            return null;
        }
        
        // Ensure createdAt is never null
        LocalDateTime createdAt = entity.getCreatedAt();
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
            System.out.println("Warning: Registration ID " + entity.getId() + " had null createdAt, using current time");
        }
        
        SellerRegistrationDTO dto = SellerRegistrationDTO.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .processedAt(entity.getProcessedAt())
                .businessName(entity.getBusinessName())
                .businessAddress(entity.getBusinessAddress())
                .businessPhone(entity.getBusinessPhone())
                .taxCode(entity.getTaxCode())
                .description(entity.getDescription())
                .createdAt(createdAt)
                .updatedAt(entity.getUpdatedAt())
                .build();
        
        // Map user info with additional logging and null-safety checks
        if (entity.getUser() != null) {
            User user = entity.getUser();
            dto.setUserId(user.getId());
            
            // Ensure username and email are properly set with fallbacks
            String username = (user.getUsername() != null) ? user.getUsername() : "";
            String email = (user.getEmail() != null) ? user.getEmail() : "";
            
            dto.setUserName(username);
            dto.setUserEmail(email);
            
            System.out.println("User data mapped - ID: " + user.getId() + 
                               ", Username: " + username + 
                               ", Email: " + email);
        } else {
            System.out.println("Warning: User entity is null for SellerRegistration ID: " + entity.getId());
        }
        
        // Map processed by info with null-safety
        if (entity.getProcessedBy() != null) {
            User processedBy = entity.getProcessedBy();
            dto.setProcessedById(processedBy.getId());
            dto.setProcessedByName(processedBy.getUsername() != null ? processedBy.getUsername() : "");
        }
        
        return dto;
    }
    
    public SellerRegistration toEntity(SellerRegistrationDTO dto, User user, User processedBy) {
        if (dto == null) {
            return null;
        }
        
        // Ensure createdAt is never null
        LocalDateTime createdAt = dto.getCreatedAt();
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        
        SellerRegistration entity = SellerRegistration.builder()
                .id(dto.getId())
                .status(dto.getStatus())
                .notes(dto.getNotes())
                .processedAt(dto.getProcessedAt())
                .businessName(dto.getBusinessName())
                .businessAddress(dto.getBusinessAddress())
                .businessPhone(dto.getBusinessPhone())
                .taxCode(dto.getTaxCode())
                .description(dto.getDescription())
                .createdAt(createdAt)
                .build();
        
        entity.setUser(user);
        entity.setProcessedBy(processedBy);
        
        return entity;
    }
    
    public List<SellerRegistrationDTO> toDTOList(List<SellerRegistration> entities) {
        if (entities == null) {
            return null;
        }
        
        List<SellerRegistrationDTO> dtoList = new ArrayList<>();
        for (SellerRegistration entity : entities) {
            dtoList.add(toDTO(entity));
        }
        
        return dtoList;
    }
} 