package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.OrderTrackingDTO;
import com.agricultural.agricultural.entity.OrderTracking;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.OrderTrackingMapper;
import com.agricultural.agricultural.repository.IOrderTrackingRepository;
import com.agricultural.agricultural.service.IOrderTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderTrackingService implements IOrderTrackingService {

    private final IOrderTrackingRepository orderTrackingRepository;
    private final OrderTrackingMapper orderTrackingMapper;

    @Override
    public List<OrderTrackingDTO> getTrackingHistoryByOrderId(Integer orderId) {
        if (orderId == null) {
            throw new BadRequestException("Order ID không được để trống");
        }
        
        List<OrderTracking> trackingHistory = orderTrackingRepository.findByOrderIdOrderByTimestampDesc(orderId);
        if (trackingHistory.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy lịch sử theo dõi cho đơn hàng với ID: " + orderId);
        }
        return orderTrackingMapper.toDTOList(trackingHistory);
    }

    @Override
    @Transactional
    public OrderTrackingDTO addTrackingStatus(OrderTrackingDTO trackingDTO) {
        if (trackingDTO == null) {
            throw new BadRequestException("Thông tin theo dõi không được để trống");
        }
        
        if (trackingDTO.getOrderId() == null) {
            throw new BadRequestException("Order ID không được để trống");
        }
        
        OrderTracking tracking = orderTrackingMapper.toEntity(trackingDTO);
        tracking = orderTrackingRepository.save(tracking);
        return orderTrackingMapper.toDTO(tracking);
    }

    @Override
    public OrderTrackingDTO getLatestTrackingByOrderId(Integer orderId) {
        if (orderId == null) {
            throw new BadRequestException("Order ID không được để trống");
        }
        
        List<OrderTracking> trackingList = orderTrackingRepository.findByOrderIdOrderByTimestampDesc(orderId);
        if (trackingList.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin theo dõi cho đơn hàng với ID: " + orderId);
        }
        return orderTrackingMapper.toDTO(trackingList.get(0));
    }
} 