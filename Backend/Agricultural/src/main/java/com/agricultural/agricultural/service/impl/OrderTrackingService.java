package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.OrderTrackingDTO;
import com.agricultural.agricultural.entity.OrderTracking;
import com.agricultural.agricultural.mapper.OrderTrackingMapper;
import com.agricultural.agricultural.repository.IOrderTrackingRepository;
import com.agricultural.agricultural.service.IOrderTrackingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderTrackingService implements IOrderTrackingService {

    private final IOrderTrackingRepository orderTrackingRepository;
    private final OrderTrackingMapper orderTrackingMapper;

    public OrderTrackingService(IOrderTrackingRepository orderTrackingRepository, OrderTrackingMapper orderTrackingMapper) {
        this.orderTrackingRepository = orderTrackingRepository;
        this.orderTrackingMapper = orderTrackingMapper;
    }

    @Override
    public List<OrderTrackingDTO> getTrackingHistoryByOrderId(Integer orderId) {
        List<OrderTracking> trackingHistory = orderTrackingRepository.findByOrderIdOrderByTimestampDesc(orderId);
        return trackingHistory.stream()
                .map(orderTrackingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderTrackingDTO addTrackingStatus(OrderTrackingDTO trackingDTO) {
        OrderTracking tracking = orderTrackingMapper.toEntity(trackingDTO);
        tracking = orderTrackingRepository.save(tracking);
        return orderTrackingMapper.toDTO(tracking);
    }

    @Override
    public OrderTrackingDTO getLatestTrackingByOrderId(Integer orderId) {
        List<OrderTracking> trackingList = orderTrackingRepository.findByOrderIdOrderByTimestampDesc(orderId);
        if (trackingList.isEmpty()) {
            return null;
        }
        return orderTrackingMapper.toDTO(trackingList.get(0));
    }
} 