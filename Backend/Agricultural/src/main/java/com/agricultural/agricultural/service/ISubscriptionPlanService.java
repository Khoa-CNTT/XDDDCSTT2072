package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.SubscriptionPlanDTO;

import java.util.List;
import java.util.Optional;

public interface ISubscriptionPlanService {
    /**
     * Lấy tất cả các gói đăng ký
     * @return Danh sách gói đăng ký
     */
    List<SubscriptionPlanDTO> getAllPlans();
    
    /**
     * Lấy tất cả các gói đăng ký đang hoạt động
     * @return Danh sách gói đăng ký đang hoạt động
     */
    List<SubscriptionPlanDTO> getActivePlans();
    
    /**
     * Lấy thông tin gói đăng ký theo ID
     * @param id ID của gói đăng ký
     * @return Thông tin gói đăng ký
     */
    Optional<SubscriptionPlanDTO> getPlanById(Integer id);
    
    /**
     * Lấy gói miễn phí
     * @return Thông tin gói miễn phí
     */
    Optional<SubscriptionPlanDTO> getFreePlan();
    
    /**
     * Tạo gói đăng ký mới
     * @param planDTO Thông tin gói đăng ký
     * @return Thông tin gói đăng ký đã tạo
     */
    SubscriptionPlanDTO createPlan(SubscriptionPlanDTO planDTO);
    
    /**
     * Cập nhật thông tin gói đăng ký
     * @param id ID của gói đăng ký
     * @param planDTO Thông tin gói đăng ký
     * @return Thông tin gói đăng ký đã cập nhật
     */
    SubscriptionPlanDTO updatePlan(Integer id, SubscriptionPlanDTO planDTO);
    
    /**
     * Kích hoạt/vô hiệu hóa gói đăng ký
     * @param id ID của gói đăng ký
     * @param active Trạng thái kích hoạt
     * @return Thông tin gói đăng ký đã cập nhật
     */
    SubscriptionPlanDTO togglePlanStatus(Integer id, boolean active);
    
    /**
     * Xóa gói đăng ký
     * @param id ID của gói đăng ký
     */
    void deletePlan(Integer id);
} 