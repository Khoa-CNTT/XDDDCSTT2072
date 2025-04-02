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
public class OrderDTO {
    private Integer id;
    private Integer buyerId;
    private Integer sellerId;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private String buyerName;
    private String sellerName;
    private List<OrderDetailDTO> orderDetails;
} 