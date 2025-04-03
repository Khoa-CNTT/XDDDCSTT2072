package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.*;
import com.agricultural.agricultural.entity.*;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.OrderMapper;
import com.agricultural.agricultural.mapper.OrderDetailMapper;
import com.agricultural.agricultural.repository.*;
import com.agricultural.agricultural.service.IOrderService;
import com.agricultural.agricultural.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final MarketPlaceRepository marketPlaceRepository;
    private final OrderMapper orderMapper;
    private final OrderDetailMapper orderDetailMapper;
    private final OrderTrackingRepository orderTrackingRepository;
    private final PaymentRepository paymentRepository;
    private final INotificationService notificationService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new BadRequestException("Không thể xác thực thông tin người dùng");
        }
        
        User currentUser = (User) principal;
//        if (currentUser.getId() == null) {
//            throw new BadRequestException("Không tìm thấy thông tin người dùng");
//        }
        
        return currentUser;
    }

    @Override
    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO) {
        User currentUser = getCurrentUser();

        // Validate input
        if (orderDTO.getOrderDetails() == null || orderDTO.getOrderDetails().isEmpty()) {
            throw new BadRequestException("Chi tiết đơn hàng không được để trống");
        }

        // Lấy thông tin sản phẩm đầu tiên để lấy seller_id
        OrderDetailDTO firstDetail = orderDTO.getOrderDetails().get(0);
        MarketPlace firstProduct = marketPlaceRepository.findById(firstDetail.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + firstDetail.getProductId()));

        Integer sellerId = firstProduct.getUser().getId();
        if (sellerId == null) {
            throw new BadRequestException("Không tìm thấy thông tin người bán của sản phẩm");
        }

        // Tạo đơn hàng mới với đầy đủ thông tin
        Order order = new Order();
        order.setBuyerId(currentUser.getId());
        order.setSellerId(sellerId);
        order.setStatus(OrderStatus.PENDING);
        order.setBuyer(currentUser);
        order.setSeller(firstProduct.getUser());

        // Lưu đơn hàng để lấy ID
        Order savedOrder = orderRepository.save(order);

        // Xử lý chi tiết đơn hàng
        List<OrderDetail> orderDetails = new ArrayList<>();

        // Xử lý sản phẩm đầu tiên
        processOrderDetail(firstProduct, firstDetail, savedOrder, orderDetails);

        // Xử lý các sản phẩm còn lại
        for (int i = 1; i < orderDTO.getOrderDetails().size(); i++) {
            OrderDetailDTO detailDTO = orderDTO.getOrderDetails().get(i);
            MarketPlace product = marketPlaceRepository.findById(detailDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + detailDTO.getProductId()));

            // Kiểm tra xem sản phẩm có cùng người bán không
            Integer currentSellerId = product.getUser().getId();
            if (!sellerId.equals(currentSellerId)) {
                throw new BadRequestException("Không thể đặt hàng từ nhiều người bán khác nhau trong cùng một đơn hàng");
            }

            processOrderDetail(product, detailDTO, savedOrder, orderDetails);
        }

        // Tạo bản ghi theo dõi đơn hàng
        OrderTracking tracking = new OrderTracking();
        tracking.setOrderId(savedOrder.getId());
        tracking.setStatus(OrderStatus.PENDING);
        tracking.setDescription("Đơn hàng đã được tạo");
        tracking.setUpdatedBy(currentUser.getId());
        orderTrackingRepository.save(tracking);

        // Gửi thông báo cho người bán
        notificationService.sendOrderNotification(
            savedOrder.getSellerId(),
            "Đơn hàng mới",
            "Bạn có đơn hàng mới #" + savedOrder.getId() + " từ " + currentUser.getUsername()
        );

        // Lấy đơn hàng đã hoàn thành kèm theo thông tin buyer, seller và orderDetails
        Order completedOrder = orderRepository.findOrderWithDetails(savedOrder.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng vừa tạo"));

        return orderMapper.toDTO(completedOrder);
    }

    private void processOrderDetail(MarketPlace product, OrderDetailDTO detailDTO, Order savedOrder, List<OrderDetail> orderDetails) {
        // Kiểm tra số lượng tồn kho
        if (detailDTO.getQuantity() > product.getQuantity()) {
            throw new BadRequestException(String.format("Sản phẩm '%s' chỉ còn %d sản phẩm trong kho",
                product.getProductName(), product.getQuantity()));
        }

        // Tạo chi tiết đơn hàng
        OrderDetail detail = new OrderDetail();
        detail.setOrderId(savedOrder.getId());
        detail.setProductId(product.getId());
        detail.setQuantity(detailDTO.getQuantity());
        detail.setPrice(product.getPrice());
        detail.setOrder(savedOrder);
        detail.setProduct(product);

        // Cập nhật số lượng sản phẩm trong kho
        product.setQuantity(product.getQuantity() - detailDTO.getQuantity());
        marketPlaceRepository.save(product);

        // Lưu chi tiết đơn hàng
        OrderDetail savedDetail = orderDetailRepository.save(detail);
        orderDetails.add(savedDetail);
        
        // Cập nhật danh sách orderDetails trong order
        if (savedOrder.getOrderDetails() == null) {
            savedOrder.setOrderDetails(new ArrayList<>());
        }
        savedOrder.getOrderDetails().add(savedDetail);
    }

    @Override
    public OrderDTO getOrderById(Integer orderId) {
        Order order = orderRepository.findOrderWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền truy cập
        if (!Objects.equals(currentUser.getId(), order.getBuyerId()) && 
            !Objects.equals(currentUser.getId(), order.getSellerId()) && 
            !currentUser.getRole().getRoleName().equals("ADMIN")) {
            throw new BadRequestException("Bạn không có quyền xem thông tin đơn hàng này");
        }
        
        return orderMapper.toDTO(order);
    }

    @Override
    public Page<OrderDTO> getOrdersByBuyer(Pageable pageable) {
        User currentUser = getCurrentUser();
        return orderRepository.findByBuyerId(currentUser.getId(), pageable)
                .map(order -> {
                    Order fullOrder = orderRepository.findOrderWithDetails(order.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + order.getId()));
                    return orderMapper.toDTO(fullOrder);
                });
    }

    @Override
    public Page<OrderDTO> getOrdersBySeller(Pageable pageable) {
        User currentUser = getCurrentUser();
        return orderRepository.findBySellerId(currentUser.getId(), pageable)
                .map(order -> {
                    Order fullOrder = orderRepository.findOrderWithDetails(order.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + order.getId()));
                    return orderMapper.toDTO(fullOrder);
                });
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Integer orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền cập nhật
        if (!Objects.equals(currentUser.getId(), order.getSellerId()) && 
            !currentUser.getRole().getRoleName().equals("ADMIN")) {
            throw new BadRequestException("Bạn không có quyền cập nhật trạng thái đơn hàng này");
        }

        // Kiểm tra trạng thái hợp lệ
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Không thể cập nhật trạng thái cho đơn hàng đã hủy");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Không thể cập nhật trạng thái cho đơn hàng đã giao");
        }

        // Kiểm tra quy trình trạng thái
        if (order.getStatus() == OrderStatus.PENDING && newStatus != OrderStatus.SHIPPED && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đang ở trạng thái PENDING chỉ có thể chuyển sang SHIPPED hoặc CANCELLED");
        }
        if (order.getStatus() == OrderStatus.SHIPPED && newStatus != OrderStatus.DELIVERED && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đang ở trạng thái SHIPPED chỉ có thể chuyển sang DELIVERED hoặc CANCELLED");
        }

        // Cập nhật trạng thái
        order.setStatus(newStatus);

        // Tạo bản ghi theo dõi đơn hàng
        OrderTracking tracking = new OrderTracking();
        tracking.setOrderId(orderId);
        tracking.setStatus(newStatus);
        tracking.setUpdatedBy(currentUser.getId());
        
        switch (newStatus) {
            case SHIPPED:
                tracking.setDescription("Đơn hàng đã được gửi đi");
                // Gửi thông báo cho người mua
                notificationService.sendOrderNotification(
                    order.getBuyerId(),
                    "Đơn hàng đã được gửi đi",
                    "Đơn hàng #" + orderId + " của bạn đã được gửi đi"
                );
                break;
            case DELIVERED:
                tracking.setDescription("Đơn hàng đã được giao thành công");
                // Gửi thông báo cho người mua
                notificationService.sendOrderNotification(
                    order.getBuyerId(),
                    "Đơn hàng đã được giao",
                    "Đơn hàng #" + orderId + " của bạn đã được giao thành công"
                );
                break;
            case CANCELLED:
                tracking.setDescription("Đơn hàng đã bị hủy");
                // Hoàn lại số lượng sản phẩm
                List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
                for (OrderDetail detail : details) {
                    MarketPlace product = marketPlaceRepository.findById(detail.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + detail.getProductId()));
                    product.setQuantity(product.getQuantity() + detail.getQuantity());
                    marketPlaceRepository.save(product);
                }
                // Gửi thông báo cho người mua
                notificationService.sendOrderNotification(
                    order.getBuyerId(),
                    "Đơn hàng đã bị hủy",
                    "Đơn hàng #" + orderId + " của bạn đã bị hủy"
                );
                break;
        }
        
        orderTrackingRepository.save(tracking);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    @Override
    @Transactional
    public void deleteOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Chỉ cho phép xóa đơn hàng đã hủy
        if (order.getStatus() != OrderStatus.CANCELLED) {
            throw new BadRequestException("Chỉ có thể xóa đơn hàng đã hủy");
        }

        // Xóa chi tiết đơn hàng
        orderDetailRepository.deleteByOrderId(orderId);

        // Xóa đơn hàng
        orderRepository.deleteById(orderId);
    }

    @Override
    public Page<OrderDTO> getOrdersByBuyerAndStatus(OrderStatus status, Pageable pageable) {
        User currentUser = getCurrentUser();
        return orderRepository.findByBuyerIdAndStatus(currentUser.getId(), status, pageable)
                .map(order -> {
                    Order fullOrder = orderRepository.findOrderWithDetails(order.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + order.getId()));
                    return orderMapper.toDTO(fullOrder);
                });
    }

    @Override
    public Page<OrderDTO> getOrdersBySellerAndStatus(OrderStatus status, Pageable pageable) {
        User currentUser = getCurrentUser();
        return orderRepository.findBySellerIdAndStatus(currentUser.getId(), status, pageable)
                .map(order -> {
                    Order fullOrder = orderRepository.findOrderWithDetails(order.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + order.getId()));
                    return orderMapper.toDTO(fullOrder);
                });
    }

    @Override
    public OrderTrackingResponse trackOrder(Integer orderId) {
        Order order = orderRepository.findOrderWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền truy cập
        if (!Objects.equals(currentUser.getId(), order.getBuyerId()) && 
            !Objects.equals(currentUser.getId(), order.getSellerId()) && 
            !currentUser.getRole().getRoleName().equals("ADMIN")) {
            throw new BadRequestException("Bạn không có quyền xem thông tin đơn hàng này");
        }
        
        List<OrderTracking> trackingHistory = orderTrackingRepository.findByOrderIdOrderByTimestampDesc(orderId);
        
        OrderTrackingResponse response = new OrderTrackingResponse();
        response.setOrderId(orderId);
        response.setCurrentStatus(order.getStatus());
        response.setOrderDate(order.getOrderDate());
        response.setBuyerName(order.getBuyer().getUsername());
        response.setSellerName(order.getSeller().getUsername());
        
        // Tính toán ngày giao hàng dự kiến (3 ngày sau khi đặt hàng)
        response.setEstimatedDeliveryDate(order.getOrderDate().plusDays(3));
        
        // Chuyển đổi lịch sử theo dõi
        List<OrderTrackingResponse.TrackingEvent> events = trackingHistory.stream()
                .map(tracking -> new OrderTrackingResponse.TrackingEvent(
                        tracking.getStatus(),
                        tracking.getTimestamp(),
                        tracking.getDescription()
                ))
                .collect(Collectors.toList());
        
        response.setTrackingHistory(events);
        
        return response;
    }

    @Override
    public Map<OrderStatus, List<OrderDTO>> getBuyerOrderHistory() {
        User currentUser = getCurrentUser();
        
        // Lấy tất cả đơn hàng của người mua
        List<Order> orders = orderRepository.findByBuyerId(currentUser.getId());
        
        // Nhóm đơn hàng theo trạng thái
        Map<OrderStatus, List<OrderDTO>> result = new HashMap<>();
        
        for (OrderStatus status : OrderStatus.values()) {
            List<OrderDTO> orderDTOs = orders.stream()
                    .filter(order -> order.getStatus() == status)
                    .map(order -> {
                        Order fullOrder = orderRepository.findOrderWithDetails(order.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + order.getId()));
                        return orderMapper.toDTO(fullOrder);
                    })
                    .collect(Collectors.toList());
            
            result.put(status, orderDTOs);
        }
        
        return result;
    }

    @Override
    public Map<OrderStatus, List<OrderDTO>> getSellerOrderHistory() {
        User currentUser = getCurrentUser();
        
        // Lấy tất cả đơn hàng của người bán
        List<Order> orders = orderRepository.findBySellerId(currentUser.getId());
        
        // Nhóm đơn hàng theo trạng thái
        Map<OrderStatus, List<OrderDTO>> result = new HashMap<>();
        
        for (OrderStatus status : OrderStatus.values()) {
            List<OrderDTO> orderDTOs = orders.stream()
                    .filter(order -> order.getStatus() == status)
                    .map(order -> {
                        Order fullOrder = orderRepository.findOrderWithDetails(order.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + order.getId()));
                        return orderMapper.toDTO(fullOrder);
                    })
                    .collect(Collectors.toList());
            
            result.put(status, orderDTOs);
        }
        
        return result;
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(Integer orderId, PaymentRequest paymentRequest) {
        Order order = orderRepository.findOrderWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        
        User currentUser = getCurrentUser();
        
        // Kiểm tra quyền thanh toán
        if (!Objects.equals(currentUser.getId(), order.getBuyerId())) {
            throw new BadRequestException("Bạn không có quyền thanh toán đơn hàng này");
        }
        
        // Kiểm tra trạng thái đơn hàng
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể thanh toán đơn hàng ở trạng thái PENDING");
        }
        
        // Tính tổng tiền đơn hàng
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderDetail detail : order.getOrderDetails()) {
            BigDecimal subtotal = detail.getPrice().multiply(new BigDecimal(detail.getQuantity()));
            totalAmount = totalAmount.add(subtotal);
        }
        
        // Tạo bản ghi thanh toán
        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID().toString());
        payment.setOrderId(orderId);
        payment.setUserId(currentUser.getId());
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentNote(paymentRequest.getPaymentNote());
        
        // Xử lý thanh toán theo phương thức
        switch (paymentRequest.getPaymentMethod()) {
            case CASH_ON_DELIVERY:
                // Thanh toán khi nhận hàng, không cần xử lý gì thêm
                payment.setStatus(PaymentStatus.PENDING);
                payment.setTransactionId("COD-" + orderId);
                break;
                
            case CREDIT_CARD:
                // Giả lập xử lý thanh toán thẻ tín dụng
                if (paymentRequest.getCardNumber() == null || paymentRequest.getCardHolderName() == null ||
                    paymentRequest.getExpiryDate() == null || paymentRequest.getCvv() == null) {
                    throw new BadRequestException("Thông tin thẻ tín dụng không đầy đủ");
                }
                
                // Giả lập gọi API thanh toán
                boolean paymentSuccess = simulatePaymentGateway(paymentRequest.getCardNumber(), totalAmount);
                
                if (paymentSuccess) {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    payment.setTransactionId("CC-" + UUID.randomUUID().toString());
                    
                    // Cập nhật trạng thái đơn hàng thành SHIPPED nếu thanh toán thành công
                    order.setStatus(OrderStatus.SHIPPED);
                    orderRepository.save(order);
                    
                    // Tạo bản ghi theo dõi đơn hàng
                    OrderTracking tracking = new OrderTracking();
                    tracking.setOrderId(orderId);
                    tracking.setStatus(OrderStatus.SHIPPED);
                    tracking.setDescription("Đơn hàng đã được thanh toán và đang được gửi đi");
                    tracking.setUpdatedBy(currentUser.getId());
                    orderTrackingRepository.save(tracking);
                    
                    // Gửi thông báo cho người bán
                    notificationService.sendOrderNotification(
                        order.getSellerId(),
                        "Đơn hàng đã được thanh toán",
                        "Đơn hàng #" + orderId + " đã được thanh toán thành công"
                    );
                } else {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setTransactionId("FAILED-" + UUID.randomUUID().toString());
                }
                break;
                
            case BANK_TRANSFER:
            case E_WALLET:
            case MOMO:
            case ZALOPAY:
            case VNPAY:
                // Giả lập xử lý thanh toán ví điện tử
                if (paymentRequest.getWalletId() == null) {
                    throw new BadRequestException("Thông tin ví điện tử không đầy đủ");
                }
                
                // Giả lập gọi API thanh toán
                boolean eWalletSuccess = simulateEWalletPayment(paymentRequest.getWalletId(), totalAmount);
                
                if (eWalletSuccess) {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    payment.setTransactionId("EW-" + UUID.randomUUID().toString());
                    
                    // Cập nhật trạng thái đơn hàng thành SHIPPED nếu thanh toán thành công
                    order.setStatus(OrderStatus.SHIPPED);
                    orderRepository.save(order);
                    
                    // Tạo bản ghi theo dõi đơn hàng
                    OrderTracking tracking = new OrderTracking();
                    tracking.setOrderId(orderId);
                    tracking.setStatus(OrderStatus.SHIPPED);
                    tracking.setDescription("Đơn hàng đã được thanh toán và đang được gửi đi");
                    tracking.setUpdatedBy(currentUser.getId());
                    orderTrackingRepository.save(tracking);
                    
                    // Gửi thông báo cho người bán
                    notificationService.sendOrderNotification(
                        order.getSellerId(),
                        "Đơn hàng đã được thanh toán",
                        "Đơn hàng #" + orderId + " đã được thanh toán thành công"
                    );
                } else {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setTransactionId("FAILED-" + UUID.randomUUID().toString());
                }
                break;
        }
        
        // Lưu bản ghi thanh toán
        Payment savedPayment = paymentRepository.save(payment);
        
        // Tạo response
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(savedPayment.getPaymentId());
        response.setOrderId(orderId);
        response.setAmount(totalAmount);
        response.setPaymentMethod(savedPayment.getPaymentMethod());
        response.setStatus(savedPayment.getStatus());
        response.setPaymentDate(savedPayment.getPaymentDate());
        response.setTransactionId(savedPayment.getTransactionId());
        
        if (savedPayment.getStatus() == PaymentStatus.COMPLETED) {
            response.setMessage("Thanh toán thành công");
        } else if (savedPayment.getStatus() == PaymentStatus.PENDING) {
            response.setMessage("Đơn hàng sẽ được thanh toán khi nhận hàng");
        } else {
            response.setMessage("Thanh toán thất bại, vui lòng thử lại");
        }
        
        return response;
    }
    
    // Phương thức giả lập thanh toán thẻ tín dụng
    private boolean simulatePaymentGateway(String cardNumber, BigDecimal amount) {
        // Giả lập thanh toán thành công với thẻ kết thúc bằng số chẵn
        return cardNumber.charAt(cardNumber.length() - 1) % 2 == 0;
    }
    
    // Phương thức giả lập thanh toán ví điện tử
    private boolean simulateEWalletPayment(String walletId, BigDecimal amount) {
        // Giả lập thanh toán thành công với ví có độ dài chẵn
        return walletId.length() % 2 == 0;
    }
}