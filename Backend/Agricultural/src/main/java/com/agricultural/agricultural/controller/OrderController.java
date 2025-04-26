package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.OrderDTO;
import com.agricultural.agricultural.dto.ResponseDTO;
import com.agricultural.agricultural.dto.response.OrderTrackingResponse;
import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.service.IOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
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
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<OrderDTO>> createOrder(@Valid @RequestBody OrderDTO orderDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            StringBuilder errors = new StringBuilder();
            bindingResult.getAllErrors().forEach(error -> 
                errors.append(error.getDefaultMessage()).append(", "));
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error("VALIDATION_ERROR", errors.toString()));
        }
        
        OrderDTO createdOrder = orderService.createOrder(orderDTO);
        return ResponseEntity.ok(ResponseDTO.success(createdOrder, "Đơn hàng đã được tạo thành công"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<OrderDTO>> getOrder(@PathVariable Integer id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(ResponseDTO.success(order));
    }

    @GetMapping("/buyer")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Page<OrderDTO>>> getOrdersByBuyer(Pageable pageable) {
        Page<OrderDTO> orders = orderService.getOrdersByBuyer(pageable);
        return ResponseEntity.ok(ResponseDTO.success(orders));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Page<OrderDTO>>> getOrdersBySeller(Pageable pageable) {
        Page<OrderDTO> orders = orderService.getOrdersBySeller(pageable);
        return ResponseEntity.ok(ResponseDTO.success(orders));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<OrderDTO>> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam OrderStatus status) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ResponseDTO.success(updatedOrder, "Trạng thái đơn hàng đã được cập nhật"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Void>> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ResponseDTO.success(null, "Đơn hàng đã được xóa thành công"));
    }

    @GetMapping("/buyer/status")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Page<OrderDTO>>> getOrdersByBuyerAndStatus(
            @RequestParam OrderStatus status,
            Pageable pageable) {
        Page<OrderDTO> orders = orderService.getOrdersByBuyerAndStatus(status, pageable);
        return ResponseEntity.ok(ResponseDTO.success(orders));
    }

    @GetMapping("/seller/status")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Page<OrderDTO>>> getOrdersBySellerAndStatus(
            @RequestParam OrderStatus status,
            Pageable pageable) {
        Page<OrderDTO> orders = orderService.getOrdersBySellerAndStatus(status, pageable);
        return ResponseEntity.ok(ResponseDTO.success(orders));
    }

    @GetMapping("/tracking/{id}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<OrderTrackingResponse>> trackOrder(@PathVariable Integer id) {
        OrderTrackingResponse tracking = orderService.trackOrder(id);
        return ResponseEntity.ok(ResponseDTO.success(tracking));
    }

    @GetMapping("/history/buyer")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Map<OrderStatus, List<OrderDTO>>>> getBuyerOrderHistory() {
        Map<OrderStatus, List<OrderDTO>> history = orderService.getBuyerOrderHistory();
        return ResponseEntity.ok(ResponseDTO.success(history));
    }

    @GetMapping("/history/seller")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<Map<OrderStatus, List<OrderDTO>>>> getSellerOrderHistory() {
        Map<OrderStatus, List<OrderDTO>> history = orderService.getSellerOrderHistory();
        return ResponseEntity.ok(ResponseDTO.success(history));
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyAuthority('User', 'Admin')")
    public ResponseEntity<ResponseDTO<PaymentResponse>> processPayment(
            @PathVariable Integer id,
            @Valid @RequestBody PaymentRequest paymentRequest) {
        PaymentResponse paymentResponse = orderService.processPayment(id, paymentRequest);
        return ResponseEntity.ok(ResponseDTO.success(paymentResponse, "Thanh toán đã được xử lý"));
    }
} 