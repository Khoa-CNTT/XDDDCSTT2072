package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.UserWeatherSubscriptionDTO;
import java.util.List;
import java.util.Optional;

public interface IUserWeatherSubscriptionService {
    
    // Lấy tất cả các đăng ký theo dõi thời tiết của người dùng
    // @param userId ID của người dùng
    // @return Danh sách đăng ký
    List<UserWeatherSubscriptionDTO> getUserSubscriptions(Integer userId);
    
    /**
     * Lấy danh sách người dùng đăng ký theo dõi một địa điểm
     * @param locationId ID của địa điểm
     * @return Danh sách đăng ký
     */
    List<UserWeatherSubscriptionDTO> getLocationSubscribers(Integer locationId);
    
    // Kiểm tra người dùng đã đăng ký theo dõi địa điểm hay chưa
    // @param userId ID của người dùng
    // @param locationId ID của địa điểm
    // @return Thông tin đăng ký
    Optional<UserWeatherSubscriptionDTO> getSubscription(Integer userId, Integer locationId);
    
    // Đăng ký theo dõi thời tiết cho người dùng
    // @param userId ID của người dùng
    // @param locationId ID của địa điểm
    // @param notificationEnabled Bật/tắt thông báo
    // @return Thông tin đăng ký
    UserWeatherSubscriptionDTO subscribeToLocation(Integer userId, Integer locationId, Boolean enableNotifications);
    
    // Cập nhật trạng thái thông báo
    // @param userId ID của người dùng
    // @param locationId ID của địa điểm
    // @param notificationEnabled Bật/tắt thông báo
    // @return Thông tin đăng ký sau khi cập nhật
    void updateNotificationStatus(Integer userId, Integer locationId, Boolean enableNotifications);
    
    // Hủy đăng ký theo dõi
    // @param userId ID của người dùng
    // @param locationId ID của địa điểm
    void unsubscribeFromLocation(Integer userId, Integer locationId);
    
    // Lấy tất cả người dùng có bật thông báo
    // @return Danh sách đăng ký
    List<UserWeatherSubscriptionDTO> getActiveNotificationSubscriptions();
    
    // Các phương thức sử dụng người dùng hiện tại
    List<UserWeatherSubscriptionDTO> getCurrentUserSubscriptions();
    Optional<UserWeatherSubscriptionDTO> getCurrentUserSubscription(Integer locationId);
    UserWeatherSubscriptionDTO subscribeCurrentUserToLocation(Integer locationId, Boolean enableNotifications);
    void updateCurrentUserNotificationStatus(Integer locationId, Boolean enableNotifications);
    void unsubscribeCurrentUserFromLocation(Integer locationId);
} 