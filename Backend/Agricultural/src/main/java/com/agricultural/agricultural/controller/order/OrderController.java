package com.agricultural.agricultural.controller.order;

import com.agricultural.agricultural.dto.OrderDTO;
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
        try {
            return ResponseEntity.ok(orderService.createOrder(orderDTO));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo đơn hàng: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy thông tin đơn hàng: " + e.getMessage());
        }
    }

    @GetMapping("/buyer")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersByBuyer(Pageable pageable) {
        try {
            return ResponseEntity.ok(orderService.getOrdersByBuyer(pageable));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách đơn hàng của người mua: " + e.getMessage());
        }
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersBySeller(Pageable pageable) {
        try {
            return ResponseEntity.ok(orderService.getOrdersBySeller(pageable));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách đơn hàng của người bán: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam OrderStatus status) {
        try {
            return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok().build();
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa đơn hàng: " + e.getMessage());
        }
    }

    @GetMapping("/buyer/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersByBuyerAndStatus(
            @RequestParam OrderStatus status,
            Pageable pageable) {
        try {
            return ResponseEntity.ok(orderService.getOrdersByBuyerAndStatus(status, pageable));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách đơn hàng theo trạng thái của người mua: " + e.getMessage());
        }
    }

    @GetMapping("/seller/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getOrdersBySellerAndStatus(
            @RequestParam OrderStatus status,
            Pageable pageable) {
        try {
            return ResponseEntity.ok(orderService.getOrdersBySellerAndStatus(status, pageable));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách đơn hàng theo trạng thái của người bán: " + e.getMessage());
        }
    }

    @GetMapping("/tracking/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderTrackingResponse> trackOrder(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(orderService.trackOrder(id));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi theo dõi đơn hàng: " + e.getMessage());
        }
    }

    @GetMapping("/history/buyer")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<OrderStatus, List<OrderDTO>>> getBuyerOrderHistory() {
        try {
            return ResponseEntity.ok(orderService.getBuyerOrderHistory());
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy lịch sử đơn hàng của người mua: " + e.getMessage());
        }
    }

    @GetMapping("/history/seller")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<OrderStatus, List<OrderDTO>>> getSellerOrderHistory() {
        try {
            return ResponseEntity.ok(orderService.getSellerOrderHistory());
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy lịch sử đơn hàng của người bán: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Integer id,
            @Valid @RequestBody PaymentRequest paymentRequest) {
        try {
            return ResponseEntity.ok(orderService.processPayment(id, paymentRequest));
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xử lý thanh toán: " + e.getMessage());
        }
    }
} 