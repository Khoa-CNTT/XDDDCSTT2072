package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.OrderDTO;
import com.agricultural.agricultural.dto.OrderTrackingResponse;
import com.agricultural.agricultural.dto.PaymentRequest;
import com.agricultural.agricultural.dto.PaymentResponse;
import com.agricultural.agricultural.entity.OrderStatus;
import com.agricultural.agricultural.service.IOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/orders")
@RequiredArgsConstructor
//@PreAuthorize("isAuthenticated()")
public class OrderController {
    private final IOrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        return ResponseEntity.ok(orderService.createOrder(orderDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/buyer")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersByBuyer(Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByBuyer(pageable));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersBySeller(Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersBySeller(pageable));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/buyer/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersByBuyerAndStatus(
            @RequestParam OrderStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByBuyerAndStatus(status, pageable));
    }

    @GetMapping("/seller/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersBySellerAndStatus(
            @RequestParam OrderStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersBySellerAndStatus(status, pageable));
    }

    @GetMapping("/tracking/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderTrackingResponse> trackOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.trackOrder(id));
    }

    @GetMapping("/history/buyer")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<OrderStatus, List<OrderDTO>>> getBuyerOrderHistory() {
        return ResponseEntity.ok(orderService.getBuyerOrderHistory());
    }

    @GetMapping("/history/seller")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<OrderStatus, List<OrderDTO>>> getSellerOrderHistory() {
        return ResponseEntity.ok(orderService.getSellerOrderHistory());
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Integer id,
            @Valid @RequestBody PaymentRequest paymentRequest) {
        return ResponseEntity.ok(orderService.processPayment(id, paymentRequest));
    }
} 