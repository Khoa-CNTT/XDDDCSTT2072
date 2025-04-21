package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingDTO {
    private Integer id;
    
    @NotNull(message = "ID đơn hàng không được để trống")
    private Integer orderId;
    
    @NotNull(message = "Trạng thái không được để trống")
    private OrderStatus status;
    
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
    
    private LocalDateTime timestamp;
    
    private Integer updatedBy;
} 