package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.ReviewStatus;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.service.IOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/order-details")
@RequiredArgsConstructor
public class OrderDetailController {
    
    private final IOrderDetailService orderDetailService;
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<OrderDetailDTO> getOrderDetail(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(orderDetailService.getOrderDetailById(id));
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy thông tin chi tiết đơn hàng: " + e.getMessage());
        }
    }
    
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetailsByOrder(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderDetailService.getOrderDetailsByOrderId(orderId));
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách chi tiết đơn hàng: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<OrderDetailDTO> updateOrderDetail(
            @PathVariable Integer id,
            @RequestBody OrderDetailDTO orderDetailDTO) {
        try {
            return ResponseEntity.ok(orderDetailService.updateOrderDetail(id, orderDetailDTO));
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật chi tiết đơn hàng: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<OrderDetailDTO> updateOrderDetailStatus(
            @PathVariable Integer id,
            @RequestParam OrderStatus status) {
        try {
            return ResponseEntity.ok(orderDetailService.updateOrderDetailStatus(id, status));
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}/review-status")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<OrderDetailDTO> updateReviewStatus(
            @PathVariable Integer id,
            @RequestParam ReviewStatus reviewStatus) {
        try {
            return ResponseEntity.ok(orderDetailService.updateReviewStatus(id, reviewStatus));
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật trạng thái đánh giá: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<Void> deleteOrderDetail(@PathVariable Integer id) {
        try {
            orderDetailService.deleteOrderDetail(id);
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa chi tiết đơn hàng: " + e.getMessage());
        }
    }
} 