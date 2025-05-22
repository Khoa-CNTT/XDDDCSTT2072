package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.UserSubscriptionDTO;

import java.util.List;
import java.util.Optional;

public interface IUserSubscriptionService {

    List<UserSubscriptionDTO> getUserSubscriptions(Integer userId);
    

    List<UserSubscriptionDTO> getActiveUserSubscriptions(Integer userId);
    

    Optional<UserSubscriptionDTO> getLatestActiveSubscription(Integer userId);
    

    UserSubscriptionDTO subscribeUserToPlan(Integer userId, Integer planId, Boolean autoRenew);
    

    void cancelSubscription(Long subscriptionId);
    

    boolean canSubscribeMoreLocations(Integer userId);
    

    int getRemainingLocations(Integer userId);
    

    void updateLocationsUsed(Integer userId, Integer locationsUsed);
    

    boolean incrementLocationsUsed(Integer userId);
    

    boolean decrementLocationsUsed(Integer userId);
    

    List<UserSubscriptionDTO> getCurrentUserSubscriptions();
    

    Optional<UserSubscriptionDTO> getCurrentUserActiveSubscription();
    

    UserSubscriptionDTO subscribeCurrentUserToPlan(Integer planId, Boolean autoRenew);

    List<UserSubscriptionDTO> getAllSubscriptions();
} 