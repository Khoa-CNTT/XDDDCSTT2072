package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.ReviewStatus;

import java.util.List;

public interface IOrderDetailService {
    OrderDetailDTO getOrderDetailById(Integer id);
    
    List<OrderDetailDTO> getOrderDetailsByOrderId(Integer orderId);
    
    OrderDetailDTO createOrderDetail(OrderDetailDTO orderDetailDTO);
    
    OrderDetailDTO updateOrderDetail(Integer id, OrderDetailDTO orderDetailDTO);
    
    OrderDetailDTO updateOrderDetailStatus(Integer id, OrderStatus status);
    
    OrderDetailDTO updateReviewStatus(Integer id, ReviewStatus reviewStatus);
    
    void deleteOrderDetail(Integer id);
    
    void deleteOrderDetailsByOrderId(Integer orderId);
} 