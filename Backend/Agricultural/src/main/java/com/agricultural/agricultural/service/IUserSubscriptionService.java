package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.UserSubscriptionDTO;

import java.util.List;
import java.util.Optional;

public interface IUserSubscriptionService {
    /**
     * Lấy tất cả gói đăng ký của người dùng
     * @param userId ID của người dùng
     * @return Danh sách gói đăng ký
     */
    List<UserSubscriptionDTO> getUserSubscriptions(Integer userId);
    
    /**
     * Lấy tất cả gói đăng ký đang hoạt động của người dùng
     * @param userId ID của người dùng
     * @return Danh sách gói đăng ký đang hoạt động
     */
    List<UserSubscriptionDTO> getActiveUserSubscriptions(Integer userId);
    
    /**
     * Lấy gói đăng ký đang hoạt động mới nhất của người dùng
     * @param userId ID của người dùng
     * @return Thông tin gói đăng ký
     */
    Optional<UserSubscriptionDTO> getLatestActiveSubscription(Integer userId);
    
    /**
     * Đăng ký gói cho người dùng
     * @param userId ID của người dùng
     * @param planId ID của gói đăng ký
     * @param autoRenew Tự động gia hạn hay không
     * @return Thông tin đăng ký
     */
    UserSubscriptionDTO subscribeUserToPlan(Integer userId, Integer planId, Boolean autoRenew);
    
    /**
     * Hủy đăng ký gói cho người dùng
     * @param subscriptionId ID của đăng ký
     */
    void cancelSubscription(Long subscriptionId);
    
    /**
     * Kiểm tra liệu người dùng có thể đăng ký thêm địa điểm
     * @param userId ID của người dùng
     * @return true nếu có thể đăng ký thêm, false nếu không
     */
    boolean canSubscribeMoreLocations(Integer userId);
    
    /**
     * Lấy số lượng địa điểm còn lại có thể đăng ký
     * @param userId ID của người dùng
     * @return Số lượng địa điểm còn lại có thể đăng ký
     */
    int getRemainingLocations(Integer userId);
    
    /**
     * Cập nhật số lượng địa điểm đã sử dụng
     * @param userId ID của người dùng
     * @param locationsUsed Số lượng địa điểm đã sử dụng
     */
    void updateLocationsUsed(Integer userId, Integer locationsUsed);
    
    /**
     * Tăng số lượng địa điểm đã sử dụng lên 1
     * @param userId ID của người dùng
     * @return true nếu tăng thành công, false nếu không
     */
    boolean incrementLocationsUsed(Integer userId);
    
    /**
     * Giảm số lượng địa điểm đã sử dụng xuống 1
     * @param userId ID của người dùng
     * @return true nếu giảm thành công, false nếu không
     */
    boolean decrementLocationsUsed(Integer userId);
    
    /**
     * Lấy tất cả gói đăng ký của người dùng hiện tại
     * @return Danh sách gói đăng ký
     */
    List<UserSubscriptionDTO> getCurrentUserSubscriptions();
    
    /**
     * Lấy gói đăng ký đang hoạt động mới nhất của người dùng hiện tại
     * @return Thông tin gói đăng ký
     */
    Optional<UserSubscriptionDTO> getCurrentUserActiveSubscription();
    
    /**
     * Đăng ký gói cho người dùng hiện tại
     * @param planId ID của gói đăng ký
     * @param autoRenew Tự động gia hạn hay không
     * @return Thông tin đăng ký
     */
    UserSubscriptionDTO subscribeCurrentUserToPlan(Integer planId, Boolean autoRenew);
    
    /**
     * Lấy tất cả đăng ký trong hệ thống
     * @return Danh sách tất cả các đăng ký
     */
    List<UserSubscriptionDTO> getAllSubscriptions();
} 