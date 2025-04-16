package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.OrderDetail;
import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.ReviewStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.OrderDetailMapper;
import com.agricultural.agricultural.repository.IOrderDetailRepository;
import com.agricultural.agricultural.service.IOrderDetailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderDetailService implements IOrderDetailService {

    private final IOrderDetailRepository orderDetailRepository;
    private final OrderDetailMapper orderDetailMapper;

    @Override
    public OrderDetailDTO getOrderDetailById(Integer id) {
        if (id == null) {
            throw new BadRequestException("ID chi tiết đơn hàng không được để trống");
        }
        
        OrderDetail orderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng với ID: " + id));
        return orderDetailMapper.toDto(orderDetail);
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailsByOrderId(Integer orderId) {
        if (orderId == null) {
            throw new BadRequestException("ID đơn hàng không được để trống");
        }
        
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        return orderDetailMapper.toDtoList(orderDetails);
    }

    @Override
    @Transactional
    public OrderDetailDTO createOrderDetail(OrderDetailDTO orderDetailDTO) {
        if (orderDetailDTO == null) {
            throw new BadRequestException("Thông tin chi tiết đơn hàng không được để trống");
        }
        
        if (orderDetailDTO.getOrderId() == null) {
            throw new BadRequestException("ID đơn hàng không được để trống");
        }
        
        if (orderDetailDTO.getProductId() == null) {
            throw new BadRequestException("ID sản phẩm không được để trống");
        }
        
        if (orderDetailDTO.getQuantity() == null || orderDetailDTO.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        
        OrderDetail orderDetail = orderDetailMapper.toEntity(orderDetailDTO);
        OrderDetail savedOrderDetail = orderDetailRepository.save(orderDetail);
        return orderDetailMapper.toDto(savedOrderDetail);
    }

    @Override
    @Transactional
    public OrderDetailDTO updateOrderDetail(Integer id, OrderDetailDTO orderDetailDTO) {
        if (id == null) {
            throw new BadRequestException("ID chi tiết đơn hàng không được để trống");
        }
        
        if (orderDetailDTO == null) {
            throw new BadRequestException("Thông tin chi tiết đơn hàng không được để trống");
        }
        
        if (orderDetailDTO.getQuantity() != null && orderDetailDTO.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        
        OrderDetail orderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng với ID: " + id));
        
        orderDetailMapper.updateEntityFromDto(orderDetailDTO, orderDetail);
        OrderDetail updatedOrderDetail = orderDetailRepository.save(orderDetail);
        return orderDetailMapper.toDto(updatedOrderDetail);
    }

    @Override
    @Transactional
    public OrderDetailDTO updateOrderDetailStatus(Integer id, OrderStatus status) {
        if (id == null) {
            throw new BadRequestException("ID chi tiết đơn hàng không được để trống");
        }
        
        if (status == null) {
            throw new BadRequestException("Trạng thái đơn hàng không được để trống");
        }
        
        OrderDetail orderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng với ID: " + id));
        
        orderDetail.setStatus(status);
        OrderDetail updatedOrderDetail = orderDetailRepository.save(orderDetail);
        return orderDetailMapper.toDto(updatedOrderDetail);
    }

    @Override
    @Transactional
    public OrderDetailDTO updateReviewStatus(Integer id, ReviewStatus reviewStatus) {
        if (id == null) {
            throw new BadRequestException("ID chi tiết đơn hàng không được để trống");
        }
        
        if (reviewStatus == null) {
            throw new BadRequestException("Trạng thái đánh giá không được để trống");
        }
        
        OrderDetail orderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng với ID: " + id));
        
        orderDetail.setReviewStatus(reviewStatus);
        OrderDetail updatedOrderDetail = orderDetailRepository.save(orderDetail);
        return orderDetailMapper.toDto(updatedOrderDetail);
    }

    @Override
    @Transactional
    public void deleteOrderDetail(Integer id) {
        if (id == null) {
            throw new BadRequestException("ID chi tiết đơn hàng không được để trống");
        }
        
        if (!orderDetailRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng với ID: " + id);
        }
        orderDetailRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteOrderDetailsByOrderId(Integer orderId) {
        if (orderId == null) {
            throw new BadRequestException("ID đơn hàng không được để trống");
        }
        
        orderDetailRepository.deleteByOrderId(orderId);
    }
} 