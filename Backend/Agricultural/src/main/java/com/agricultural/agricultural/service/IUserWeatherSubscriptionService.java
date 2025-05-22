package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.UserWeatherSubscriptionDTO;
import java.util.List;
import java.util.Optional;

public interface IUserWeatherSubscriptionService {
    

    List<UserWeatherSubscriptionDTO> getUserSubscriptions(Integer userId);
    


    List<UserWeatherSubscriptionDTO> getLocationSubscribers(Integer locationId);

    Optional<UserWeatherSubscriptionDTO> getSubscription(Integer userId, Integer locationId);
    

    UserWeatherSubscriptionDTO subscribeToLocation(Integer userId, Integer locationId, Boolean enableNotifications);
    

    void updateNotificationStatus(Integer userId, Integer locationId, Boolean enableNotifications);
    

    void unsubscribeFromLocation(Integer userId, Integer locationId);
    

    List<UserWeatherSubscriptionDTO> getActiveNotificationSubscriptions();
    
    List<UserWeatherSubscriptionDTO> getCurrentUserSubscriptions();
    Optional<UserWeatherSubscriptionDTO> getCurrentUserSubscription(Integer locationId);
    UserWeatherSubscriptionDTO subscribeCurrentUserToLocation(Integer locationId, Boolean enableNotifications);
    void updateCurrentUserNotificationStatus(Integer locationId, Boolean enableNotifications);
    void unsubscribeCurrentUserFromLocation(Integer locationId);
} 