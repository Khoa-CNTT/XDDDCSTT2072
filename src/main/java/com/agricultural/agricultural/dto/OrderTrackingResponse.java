package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {
    private Integer orderId;
    private OrderStatus currentStatus;
    private LocalDateTime orderDate;
    private LocalDateTime estimatedDeliveryDate;
    private String buyerName;
    private String sellerName;
    private List<TrackingEvent> trackingHistory;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackingEvent {
        private OrderStatus status;
        private LocalDateTime timestamp;
        private String description;
    }
} 