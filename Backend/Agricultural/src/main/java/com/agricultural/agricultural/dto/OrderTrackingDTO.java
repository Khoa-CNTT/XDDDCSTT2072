package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.OrderStatus;
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
    private Integer orderId;
    private OrderStatus status;
    private String description;
    private LocalDateTime timestamp;
    private Integer updatedBy;
} 