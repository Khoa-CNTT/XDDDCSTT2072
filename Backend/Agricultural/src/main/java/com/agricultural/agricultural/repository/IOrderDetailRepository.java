package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IOrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrderId(Integer orderId);
    void deleteByOrderId(Integer orderId);
    
    // Thêm phương thức mới để tìm chi tiết đơn hàng theo danh sách ID sản phẩm
    List<OrderDetail> findByProductIdIn(List<Integer> productIds);
} 