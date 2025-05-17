package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerRegistrationDTO {
    
    private Integer id;
    
    private Integer userId;
    
    private String userName;
    
    private String userEmail;
    
    private String status;
    
    private String notes;
    
    private Integer processedById;
    
    private String processedByName;
    
    private LocalDateTime processedAt;
    
    @NotBlank(message = "Tên doanh nghiệp không được để trống")
    private String businessName;
    
    @NotBlank(message = "Địa chỉ doanh nghiệp không được để trống")
    private String businessAddress;
    
    @NotBlank(message = "Số điện thoại doanh nghiệp không được để trống")
    private String businessPhone;
    
    private String taxCode;
    
    private String description;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
} 