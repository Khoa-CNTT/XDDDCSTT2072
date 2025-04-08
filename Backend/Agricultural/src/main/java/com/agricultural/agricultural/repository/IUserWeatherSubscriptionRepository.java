package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.UserWeatherSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserWeatherSubscriptionRepository extends JpaRepository<UserWeatherSubscription, Integer> {
    
    @Query("SELECT s FROM UserWeatherSubscription s WHERE s.user.id = :userId")
    List<UserWeatherSubscription> findByUserId(Integer userId);
    
    @Query("SELECT s FROM UserWeatherSubscription s WHERE s.user.id = :userId AND s.location.id = :locationId")
    Optional<UserWeatherSubscription> findByUserIdAndLocationId(Integer userId, Integer locationId);
    
    List<UserWeatherSubscription> findByEnableNotificationsTrue();
    
    @Query("SELECT s FROM UserWeatherSubscription s WHERE s.location.id = :locationId")
    List<UserWeatherSubscription> findByLocationId(Integer locationId);
} 