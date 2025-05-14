package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.OrderTrackingDTO;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.service.IOrderTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/order-tracking")
@RequiredArgsConstructor
public class OrderTrackingController {
    
    private final IOrderTrackingService orderTrackingService;
    
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<List<OrderTrackingDTO>> getTrackingHistoryByOrderId(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderTrackingService.getTrackingHistoryByOrderId(orderId));
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy lịch sử theo dõi đơn hàng: " + e.getMessage());
        }
    }
    
    @GetMapping("/order/{orderId}/latest")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<OrderTrackingDTO> getLatestTrackingByOrderId(@PathVariable Integer orderId) {
        try {
            OrderTrackingDTO latestTracking = orderTrackingService.getLatestTrackingByOrderId(orderId);
            if (latestTracking == null) {
                throw new ResourceNotFoundException("Không tìm thấy thông tin theo dõi cho đơn hàng với ID: " + orderId);
            }
            return ResponseEntity.ok(latestTracking);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy thông tin theo dõi mới nhất: " + e.getMessage());
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Seller', 'Admin')")
    public ResponseEntity<OrderTrackingDTO> addTrackingStatus(@RequestBody OrderTrackingDTO trackingDTO) {
        try {
            return ResponseEntity.ok(orderTrackingService.addTrackingStatus(trackingDTO));
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi thêm mới trạng thái theo dõi: " + e.getMessage());
        }
    }
} 