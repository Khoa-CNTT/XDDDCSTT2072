package com.agricultural.agricultural.entity.enumeration;

public enum OrderStatus {
    PENDING,        // Đơn hàng mới tạo
    CONFIRMED,      // Đã xác nhận
    PROCESSING,     // Đang xử lý
    SHIPPED,        // Đã giao cho đơn vị vận chuyển
    DELIVERED,      // Đã giao hàng
    COMPLETED,      // Hoàn thành (sau khi được xác nhận)
    CANCELLED,      // Đã hủy
    RETURNED,       // Đã trả hàng
    REFUNDED        // Đã hoàn tiền
} 