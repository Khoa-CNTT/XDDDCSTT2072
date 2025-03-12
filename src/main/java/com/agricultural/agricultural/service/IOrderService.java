package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.*;
import com.agricultural.agricultural.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface IOrderService {
    OrderDTO createOrder(OrderDTO orderDTO);
    OrderDTO getOrderById(Integer orderId);
    Page<OrderDTO> getOrdersByBuyer(Pageable pageable);
    Page<OrderDTO> getOrdersBySeller(Pageable pageable);
    OrderDTO updateOrderStatus(Integer orderId, OrderStatus newStatus);
    void deleteOrder(Integer orderId);
    Page<OrderDTO> getOrdersByBuyerAndStatus(OrderStatus status, Pageable pageable);
    Page<OrderDTO> getOrdersBySellerAndStatus(OrderStatus status, Pageable pageable);
    
    // Phương thức mới cho theo dõi đơn hàng
    OrderTrackingResponse trackOrder(Integer orderId);
    
    // Phương thức mới cho lịch sử đơn hàng
    Map<OrderStatus, List<OrderDTO>> getBuyerOrderHistory();
    Map<OrderStatus, List<OrderDTO>> getSellerOrderHistory();
    
    // Phương thức mới cho thanh toán
    PaymentResponse processPayment(Integer orderId, PaymentRequest paymentRequest);
} 