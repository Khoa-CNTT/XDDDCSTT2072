package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDTO {
    private Integer id;
    
    @NotBlank(message = "Tên gói đăng ký không được để trống")
    private String name;
    
    private String description;
    
    @NotNull(message = "Giá gói đăng ký không được để trống")
    @Min(value = 0, message = "Giá gói đăng ký không được âm")
    private BigDecimal price;
    
    @NotNull(message = "Thời hạn gói đăng ký không được để trống")
    @Positive(message = "Thời hạn gói đăng ký phải lớn hơn 0")
    private Integer durationMonths;
    
    @NotNull(message = "Số lượng địa điểm tối đa không được để trống")
    @Positive(message = "Số lượng địa điểm tối đa phải lớn hơn 0")
    private Integer maxLocations;
    
    private Boolean isActive;
    
    private Boolean isFree;
    
    /**
     * Quyền đăng ký bán hàng
     */
    private Boolean canSellProducts;
    
    /**
     * Quyền tham gia diễn đàn
     */
    private Boolean canAccessForum;
    
    /**
     * Quyền mua sản phẩm
     */
    private Boolean canPurchaseProducts;
    
    /**
     * Quyền sử dụng AI chat
     */
    private Boolean canUseAIChat;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 