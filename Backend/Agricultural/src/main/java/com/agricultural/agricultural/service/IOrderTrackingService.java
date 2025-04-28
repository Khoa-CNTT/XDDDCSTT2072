package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.OrderTrackingDTO;
import java.util.List;

public interface IOrderTrackingService {
    
    List<OrderTrackingDTO> getTrackingHistoryByOrderId(Integer orderId);
    
    OrderTrackingDTO addTrackingStatus(OrderTrackingDTO trackingDTO);
    
    OrderTrackingDTO getLatestTrackingByOrderId(Integer orderId);
} 