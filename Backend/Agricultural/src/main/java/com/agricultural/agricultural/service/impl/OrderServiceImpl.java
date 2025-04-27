package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.*;
import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.response.OrderTrackingResponse;
import com.agricultural.agricultural.dto.response.PaymentResponse;
import com.agricultural.agricultural.dto.response.PaymentUrlResponse;
import com.agricultural.agricultural.entity.*;
import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.BusinessException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.OrderMapper;
import com.agricultural.agricultural.mapper.OrderDetailMapper;
import com.agricultural.agricultural.repository.*;
import com.agricultural.agricultural.service.IOrderService;
import com.agricultural.agricultural.service.IPaymentService;
import com.agricultural.agricultural.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

import static com.agricultural.agricultural.entity.enumeration.PaymentMethod.COD;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements IOrderService {
    private final IOrderRepository orderRepository;
    private final IOrderDetailRepository orderDetailRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final OrderMapper orderMapper;
    private final OrderDetailMapper orderDetailMapper;
    private final IOrderTrackingRepository orderTrackingRepository;
    private final IPaymentRepository paymentRepository;
    private final INotificationService notificationService;
    private final IPaymentService paymentService;
    private final NotificationServiceImpl realTimeNotificationService;

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
        try {
        User currentUser = getCurrentUser();

            // Validate đầu vào
            validateOrderInput(orderDTO);

        // Lấy thông tin sản phẩm đầu tiên để lấy seller_id
        OrderDetailDTO firstDetail = orderDTO.getOrderDetails().get(0);
            MarketPlace firstProduct = findAndValidateProduct(firstDetail.getProductId());

        Integer sellerId = firstProduct.getUser().getId();
        if (sellerId == null) {
            throw new BadRequestException("Không tìm thấy thông tin người bán của sản phẩm");
        }

        // Tạo đơn hàng mới với đầy đủ thông tin
            Order order = initializeOrder(orderDTO, currentUser, sellerId, firstProduct);

        // Lưu đơn hàng để lấy ID
        Order savedOrder = orderRepository.save(order);

        // Xử lý chi tiết đơn hàng
        List<OrderDetail> orderDetails = new ArrayList<>();

        // Xử lý sản phẩm đầu tiên
        processOrderDetail(firstProduct, firstDetail, savedOrder, orderDetails);

        // Xử lý các sản phẩm còn lại
            processRemainingOrderDetails(orderDTO, sellerId, savedOrder, orderDetails);
            
            // Tạo bản ghi theo dõi đơn hàng
            createOrderTrackingForNewOrder(savedOrder, currentUser);
            
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
        } catch (ResourceNotFoundException | BadRequestException e) {
            // Đây là các lỗi dự kiến, chỉ cần ném lại để GlobalExceptionHandler xử lý
            throw e;
        } catch (Exception e) {
            // Log lỗi không dự kiến
            String errorMessage = "Lỗi khi tạo đơn hàng: " + e.getMessage();
            System.err.println(errorMessage);
            e.printStackTrace();
            throw new BusinessException(errorMessage);
        }
    }
    
    /**
     * Kiểm tra dữ liệu đầu vào đơn hàng
     */
    private void validateOrderInput(OrderDTO orderDTO) {
        if (orderDTO.getOrderDetails() == null || orderDTO.getOrderDetails().isEmpty()) {
            throw new BadRequestException("Chi tiết đơn hàng không được để trống");
        }
    }
    
    /**
     * Tìm sản phẩm và xác thực
     */
    private MarketPlace findAndValidateProduct(Integer productId) {
        return marketPlaceRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
    }
    
    /**
     * Khởi tạo đơn hàng mới
     */
    private Order initializeOrder(OrderDTO orderDTO, User currentUser, Integer sellerId, MarketPlace firstProduct) {
        Order order = new Order();
        order.setBuyerId(currentUser.getId());
        order.setSellerId(sellerId);
        order.setStatus(OrderStatus.PENDING);
        order.setBuyer(currentUser);
        order.setSeller(firstProduct.getUser());
        
        // Kiểm tra và thiết lập thông tin giao hàng
        if (orderDTO.getShippingName() != null && !orderDTO.getShippingName().trim().isEmpty()) {
            order.setShippingName(orderDTO.getShippingName());
        } else {
            // Sử dụng tên người dùng hiện tại nếu không cung cấp
            order.setShippingName(currentUser.getUsername());
        }
        
        if (orderDTO.getShippingPhone() != null && !orderDTO.getShippingPhone().trim().isEmpty()) {
            order.setShippingPhone(orderDTO.getShippingPhone());
        } else {
            // Sử dụng số điện thoại người dùng hiện tại nếu không cung cấp
            if (currentUser.getPhone() != null && !currentUser.getPhone().trim().isEmpty()) {
                order.setShippingPhone(currentUser.getPhone());
            } else {
                throw new BadRequestException("Số điện thoại giao hàng không được để trống. Vui lòng cung cấp số điện thoại trong thông tin giao hàng.");
            }
        }
        
        if (orderDTO.getShippingAddress() != null && !orderDTO.getShippingAddress().trim().isEmpty()) {
            order.setShippingAddress(orderDTO.getShippingAddress());
        } else {
            throw new BadRequestException("Địa chỉ giao hàng không được để trống. Vui lòng cung cấp địa chỉ giao hàng.");
        }
        
        // Thiết lập các thông tin khác về địa chỉ giao hàng
        order.setShippingCity(orderDTO.getShippingCity());
        order.setShippingCountry(orderDTO.getShippingCountry() != null ? orderDTO.getShippingCountry() : "Vietnam");
        order.setShippingPostalCode(orderDTO.getShippingPostalCode());
        
        // Thiết lập các thông tin khác
        order.setPaymentMethod(orderDTO.getPaymentMethod() != null ? orderDTO.getPaymentMethod() : COD);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setNotes(orderDTO.getNotes());
        order.setShippingFee(orderDTO.getShippingFee() != null ? orderDTO.getShippingFee() : BigDecimal.ZERO);
        
        // Khởi tạo các giá trị mặc định cho tính toán tài chính
        order.setSubtotal(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setTotalQuantity(0);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTaxAmount(BigDecimal.ZERO);
        
        return order;
    }
    
    /**
     * Xử lý các chi tiết đơn hàng còn lại
     */
    private void processRemainingOrderDetails(OrderDTO orderDTO, Integer sellerId, Order savedOrder, List<OrderDetail> orderDetails) {
        for (int i = 1; i < orderDTO.getOrderDetails().size(); i++) {
            OrderDetailDTO detailDTO = orderDTO.getOrderDetails().get(i);
            MarketPlace product = findAndValidateProduct(detailDTO.getProductId());

            // Kiểm tra xem sản phẩm có cùng người bán không
            Integer currentSellerId = product.getUser().getId();
            if (!sellerId.equals(currentSellerId)) {
                throw new BadRequestException("Không thể đặt hàng từ nhiều người bán khác nhau trong cùng một đơn hàng");
            }

            processOrderDetail(product, detailDTO, savedOrder, orderDetails);
        }
        }

    /**
     * Tạo bản ghi theo dõi cho đơn hàng mới
     */
    private void createOrderTrackingForNewOrder(Order order, User currentUser) {
        OrderTracking tracking = new OrderTracking();
        tracking.setOrderId(order.getId());
        tracking.setStatus(OrderStatus.PENDING);
        tracking.setDescription("Đơn hàng đã được tạo");
        tracking.setUpdatedBy(currentUser.getId());
        orderTrackingRepository.save(tracking);
    }

    /**
     * Xử lý chi tiết đơn hàng
     */
    private void processOrderDetail(MarketPlace product, OrderDetailDTO detailDTO, Order savedOrder, List<OrderDetail> orderDetails) {
        try {
        // Kiểm tra số lượng tồn kho
        if (detailDTO.getQuantity() > product.getQuantity()) {
            throw new BadRequestException(String.format("Sản phẩm '%s' chỉ còn %d sản phẩm trong kho",
                product.getProductName(), product.getQuantity()));
        }

        // Tạo chi tiết đơn hàng
        OrderDetail detail = new OrderDetail();
        detail.setOrderId(savedOrder.getId());
        detail.setProductId(product.getId());
            detail.setProductName(product.getProductName());
            detail.setProductImage(product.getImageUrl());
        detail.setQuantity(detailDTO.getQuantity());
            
            // Đảm bảo giá không null
            if (product.getPrice() == null) {
                product.setPrice(BigDecimal.ZERO);
            }
            
            // Lưu giá 
            detail.setOriginalPrice(product.getPrice());
        detail.setPrice(product.getPrice());
            detail.setDiscountAmount(BigDecimal.ZERO);
            
            // Thiết lập mối quan hệ
        detail.setOrder(savedOrder);
        detail.setProduct(product);
            
            // Nếu sản phẩm có biến thể, lưu thông tin biến thể
            ProductVariant variant = null;
            if (detailDTO.getVariantId() != null) {
                // Tìm biến thể từ danh sách biến thể của sản phẩm
                for (ProductVariant v : product.getVariants()) {
                    if (v.getId().equals(detailDTO.getVariantId())) {
                        variant = v;
                        break;
                    }
                }
                
                if (variant != null) {
                    detail.setVariantId(variant.getId());
                    detail.setVariantName(variant.getName());
                    detail.setVariant(variant);
                    
                    // Sử dụng getFinalPrice từ biến thể
                    BigDecimal variantPrice = variant.getFinalPrice();
                    if (variantPrice != null) {
                        detail.setOriginalPrice(variantPrice);
                        detail.setPrice(variantPrice);
                    }
                    
                    // Nếu sản phẩm chính đang có giảm giá, tính lại số tiền giảm giá cho biến thể
                    if (product.isOnSale()) {
                        // Tính phần trăm giảm giá từ sản phẩm chính
                        BigDecimal basePrice = product.getPrice();
                        BigDecimal salePrice = product.getSalePrice();
                        if (basePrice != null && basePrice.compareTo(BigDecimal.ZERO) > 0 && salePrice != null) {
                            try {
                                BigDecimal discountRatio = BigDecimal.ONE.subtract(salePrice.divide(basePrice, 4, BigDecimal.ROUND_HALF_UP));
                                
                                // Áp dụng tỷ lệ giảm giá tương tự cho giá biến thể
                                BigDecimal originalVariantPrice = product.getPrice().add(variant.getPriceAdjustment() != null ? variant.getPriceAdjustment() : BigDecimal.ZERO);
                                BigDecimal discountAmount = originalVariantPrice.multiply(discountRatio).setScale(2, BigDecimal.ROUND_HALF_UP);
                                detail.setDiscountAmount(discountAmount);
                            } catch (ArithmeticException e) {
                                // Xử lý lỗi chia cho 0 hoặc các lỗi tính toán khác
                                detail.setDiscountAmount(BigDecimal.ZERO);
                            }
                        }
                    }
                }
            }

        // Cập nhật số lượng sản phẩm trong kho
        product.setQuantity(product.getQuantity() - detailDTO.getQuantity());
            
            // Tăng số lượng mua
            product.setPurchaseCount(product.getPurchaseCount() + detailDTO.getQuantity());
            
        marketPlaceRepository.save(product);
    
            // Đảm bảo tính toán totalPrice trước khi lưu
            detail.calculateTotalPrice();

        // Lưu chi tiết đơn hàng
        OrderDetail savedDetail = orderDetailRepository.save(detail);
        orderDetails.add(savedDetail);
        
        // Cập nhật danh sách orderDetails trong order
        if (savedOrder.getOrderDetails() == null) {
            savedOrder.setOrderDetails(new ArrayList<>());
        }
        savedOrder.getOrderDetails().add(savedDetail);
        } catch (Exception e) {
            // Log lỗi chi tiết
            System.err.println("Lỗi khi xử lý chi tiết đơn hàng: " + e.getMessage());
            e.printStackTrace();
            throw new BadRequestException("Lỗi khi xử lý chi tiết đơn hàng: " + e.getMessage());
        }
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
        try {
            // Tìm đơn hàng cần cập nhật
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
            validateStatusTransition(order.getStatus(), newStatus);

            // Cập nhật trạng thái
            order.setStatus(newStatus);

            // Tạo bản ghi theo dõi đơn hàng
            OrderTracking tracking = createOrderTracking(orderId, newStatus, currentUser);
            
            // Xử lý theo từng trạng thái
            handleStatusSpecificActions(order, newStatus, tracking, currentUser);
            
            // Lưu bản ghi theo dõi
            orderTrackingRepository.save(tracking);
            
            // Lưu đơn hàng đã cập nhật
            Order updatedOrder = orderRepository.save(order);
            
            // Gửi thông báo realtime cho người dùng
            NotificationDTO notification = NotificationDTO.builder()
                    .userId(order.getBuyerId())
                    .title("Cập nhật đơn hàng #" + order.getOrderNumber())
                    .message("Đơn hàng #" + order.getOrderNumber() + " của bạn đã được cập nhật sang trạng thái: " + newStatus.name())
                    .type("ORDER_STATUS")
                    .redirectUrl("/orders/" + order.getId())
                    .build();
            
            realTimeNotificationService.sendRealTimeNotification(notification);
            
            // Trả về DTO của đơn hàng
            return orderMapper.toDTO(updatedOrder);
        } catch (ResourceNotFoundException | BadRequestException e) {
            // Đây là các lỗi dự kiến, chỉ cần ném lại để GlobalExceptionHandler xử lý
            throw e;
        } catch (Exception e) {
            // Log lỗi không dự kiến
            String errorMessage = "Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage();
            System.err.println(errorMessage);
            e.printStackTrace();
            throw new BusinessException(errorMessage);
        }
    }
    
    /**
     * Xác thực chuyển đổi trạng thái đơn hàng
     */
    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.PENDING && newStatus != OrderStatus.SHIPPED && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đang ở trạng thái PENDING chỉ có thể chuyển sang SHIPPED hoặc CANCELLED");
        }
        if (currentStatus == OrderStatus.SHIPPED && newStatus != OrderStatus.DELIVERED && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đang ở trạng thái SHIPPED chỉ có thể chuyển sang DELIVERED hoặc CANCELLED");
        }
    }
    
    /**
     * Tạo bản ghi theo dõi đơn hàng
     */
    private OrderTracking createOrderTracking(Integer orderId, OrderStatus status, User user) {
        OrderTracking tracking = new OrderTracking();
        tracking.setOrderId(orderId);
        tracking.setStatus(status);
        tracking.setUpdatedBy(user.getId());
        return tracking;
    }
    
    /**
     * Xử lý các hành động cụ thể theo trạng thái
     */
    private void handleStatusSpecificActions(Order order, OrderStatus newStatus, OrderTracking tracking, User currentUser) {
        Integer orderId = order.getId();
        
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
                restoreProductQuantities(orderId);
                // Gửi thông báo cho người mua
                notificationService.sendOrderNotification(
                    order.getBuyerId(),
                    "Đơn hàng đã bị hủy",
                    "Đơn hàng #" + orderId + " của bạn đã bị hủy"
                );
                break;
        }
    }
    
    /**
     * Khôi phục số lượng sản phẩm khi hủy đơn hàng
     */
    @Transactional
    protected void restoreProductQuantities(Integer orderId) {
        try {
            List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
            for (OrderDetail detail : details) {
                MarketPlace product = marketPlaceRepository.findById(detail.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + detail.getProductId()));
                product.setQuantity(product.getQuantity() + detail.getQuantity());
                marketPlaceRepository.save(product);
            }
        } catch (Exception e) {
            String errorMessage = "Lỗi khi khôi phục số lượng sản phẩm: " + e.getMessage();
            System.err.println(errorMessage);
            e.printStackTrace();
            throw new BusinessException(errorMessage);
        }
    }

    @Override
    @Transactional
    public void deleteOrder(Integer orderId) {
        try {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Chỉ cho phép xóa đơn hàng đã hủy
        if (order.getStatus() != OrderStatus.CANCELLED) {
            throw new BadRequestException("Chỉ có thể xóa đơn hàng đã hủy");
        }

            // Kiểm tra quyền xóa (chỉ người mua hoặc admin có thể xóa)
            User currentUser = getCurrentUser();
            if (!Objects.equals(currentUser.getId(), order.getBuyerId()) && 
                !currentUser.getRole().getRoleName().equals("ADMIN")) {
                throw new BadRequestException("Bạn không có quyền xóa đơn hàng này");
        }

        // Xóa chi tiết đơn hàng
        orderDetailRepository.deleteByOrderId(orderId);

            // Xóa bản ghi theo dõi đơn hàng
            orderTrackingRepository.deleteByOrderId(orderId);

        // Xóa đơn hàng
        orderRepository.deleteById(orderId);
            
        } catch (ResourceNotFoundException | BadRequestException e) {
            // Đây là các lỗi dự kiến, chỉ cần ném lại để GlobalExceptionHandler xử lý
            throw e;
        } catch (Exception e) {
            // Log lỗi không dự kiến
            String errorMessage = "Lỗi khi xóa đơn hàng: " + e.getMessage();
            System.err.println(errorMessage);
            e.printStackTrace();
            throw new BusinessException(errorMessage);
        }
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
        Long totalAmount = 0L;
        for (OrderDetail detail : order.getOrderDetails()) {
            Long subtotal = detail.getPrice().longValue() * detail.getQuantity();
            totalAmount += subtotal;
        }

        // Tạo payment request mới cho PayOS
        PaymentRequest payosRequest = new PaymentRequest();
        payosRequest.setOrderId(orderId.longValue());
        payosRequest.setAmount(totalAmount);
        payosRequest.setPaymentMethod(paymentRequest.getPaymentMethod());
        payosRequest.setDescription("Thanh toán đơn hàng #" + orderId);
        payosRequest.setBuyerName(currentUser.getUsername());
        payosRequest.setBuyerEmail(currentUser.getEmail());
        payosRequest.setBuyerPhone(currentUser.getPhone());

        // Xử lý theo phương thức thanh toán
        if ("COD".equalsIgnoreCase(paymentRequest.getPaymentMethod())) {
            // Thanh toán COD
        Payment payment = new Payment();
            payment.setOrderId((int) orderId.longValue());
            payment.setUserId((int) currentUser.getId());
        payment.setAmount(totalAmount);
            payment.setPaymentMethod("COD");
                payment.setStatus(PaymentStatus.PENDING);
                payment.setTransactionId("COD-" + orderId);
            payment.setPaymentNote("Thanh toán khi nhận hàng");
            payment.setCreatedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);
        
            return PaymentResponse.builder()
                    .success(true)
                    .message("Đơn hàng sẽ được thanh toán khi nhận hàng")
                    .orderId(orderId.longValue())
                    .amount(totalAmount)
                    .paymentMethod("COD")
                    .transactionId(savedPayment.getTransactionId())
                    .timestamp(LocalDateTime.now())
                    .build();
        } else {
            // Thanh toán online
            try {
                PaymentUrlResponse urlResponse = paymentService.processPayment(payosRequest);

                return PaymentResponse.builder()
                        .success(true)
                        .message(urlResponse.getMessage() != null ? urlResponse.getMessage() : "Thanh toán trực tuyến được khởi tạo")
                        .orderId(urlResponse.getOrderId() != null ? urlResponse.getOrderId().longValue() : orderId.longValue())
                        .amount(urlResponse.getAmount() != null ? urlResponse.getAmount() : totalAmount)
                        .paymentMethod(paymentRequest.getPaymentMethod())
                        .transactionId(urlResponse.getTransactionId())
                        .redirectUrl(urlResponse.getPaymentUrl())
                        .timestamp(LocalDateTime.now())
                        .build();
            } catch (Exception e) {
                log.error("Lỗi khi xử lý thanh toán: {}", e.getMessage());
                throw new BadRequestException("Không thể xử lý thanh toán: " + e.getMessage());
            }
        }
    }

}