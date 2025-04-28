package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.UserWeatherSubscriptionDTO;
import com.agricultural.agricultural.entity.UserWeatherSubscription;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.WeatherMonitoredLocation;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.UserWeatherSubscriptionMapper;
import com.agricultural.agricultural.repository.IUserWeatherSubscriptionRepository;
import com.agricultural.agricultural.repository.IWeatherMonitoredLocationRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IUserWeatherSubscriptionService;
import com.agricultural.agricultural.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserWeatherSubscriptionService implements IUserWeatherSubscriptionService {
    private final IUserWeatherSubscriptionRepository subscriptionRepository;
    private final IWeatherMonitoredLocationRepository locationRepository;
    private final IUserRepository userRepository;
    private final UserWeatherSubscriptionMapper subscriptionMapper;

    @Override
    public List<UserWeatherSubscriptionDTO> getUserSubscriptions(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        return subscriptionRepository.findByUserId(userId).stream()
                .map(subscriptionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserWeatherSubscriptionDTO> getLocationSubscribers(Integer locationId) {
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        // Kiểm tra xem địa điểm có tồn tại không
        locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa điểm với ID: " + locationId));

        // Lấy danh sách đăng ký theo locationId
        List<UserWeatherSubscription> subscriptions = subscriptionRepository.findByLocationId(locationId);
        
        // Chuyển đổi sang DTO và trả về
        return subscriptions.stream()
                .map(subscriptionMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public Optional<UserWeatherSubscriptionDTO> getSubscription(Integer userId, Integer locationId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        return subscriptionRepository.findByUserIdAndLocationId(userId, locationId)
                .map(subscriptionMapper::toDTO);
    }

    @Override
    @Transactional
    public UserWeatherSubscriptionDTO subscribeToLocation(Integer userId, Integer locationId, Boolean enableNotifications) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        if (enableNotifications == null) {
            enableNotifications = false;
        }
        
        // Kiểm tra xem địa điểm có tồn tại
        WeatherMonitoredLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa điểm với ID: " + locationId));

        // Kiểm tra xem người dùng có tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // Kiểm tra xem người dùng đã đăng ký địa điểm này chưa
        Optional<UserWeatherSubscription> existingSubscription = 
                subscriptionRepository.findByUserIdAndLocationId(userId, locationId);
        
        if (existingSubscription.isPresent()) {
            // Nếu đã đăng ký, cập nhật trạng thái
            UserWeatherSubscription subscription = existingSubscription.get();
            subscription.setEnableNotifications(enableNotifications);
            return subscriptionMapper.toDTO(subscriptionRepository.save(subscription));
        } else {
            // Nếu chưa đăng ký, tạo mới
            UserWeatherSubscription subscription = new UserWeatherSubscription();
            subscription.setUser(user);
            subscription.setLocation(location);
            subscription.setEnableNotifications(enableNotifications);
            return subscriptionMapper.toDTO(subscriptionRepository.save(subscription));
        }
    }

    @Override
    @Transactional
    public void updateNotificationStatus(Integer userId, Integer locationId, Boolean enableNotifications) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        if (enableNotifications == null) {
            enableNotifications = false;
        }
        
        UserWeatherSubscription subscription = subscriptionRepository.findByUserIdAndLocationId(userId, locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký theo dõi thời tiết cho người dùng và địa điểm này"));
        
        subscription.setEnableNotifications(enableNotifications);
        subscriptionRepository.save(subscription);
    }

    @Override
    @Transactional
    public void unsubscribeFromLocation(Integer userId, Integer locationId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        UserWeatherSubscription subscription = subscriptionRepository.findByUserIdAndLocationId(userId, locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký theo dõi thời tiết cho người dùng và địa điểm này"));
        
        subscriptionRepository.delete(subscription);
    }

    @Override
    public List<UserWeatherSubscriptionDTO> getActiveNotificationSubscriptions() {
        return subscriptionRepository.findByEnableNotificationsTrue().stream()
                .map(subscriptionMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Các phương thức sử dụng người dùng hiện tại
    @Override
    public List<UserWeatherSubscriptionDTO> getCurrentUserSubscriptions() {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        return getUserSubscriptions(currentUserId);
    }

    @Override
    public Optional<UserWeatherSubscriptionDTO> getCurrentUserSubscription(Integer locationId) {
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        return getSubscription(currentUserId, locationId);
    }

    @Override
    @Transactional
    public UserWeatherSubscriptionDTO subscribeCurrentUserToLocation(Integer locationId, Boolean enableNotifications) {
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        return subscribeToLocation(currentUserId, locationId, enableNotifications);
    }

    @Override
    @Transactional
    public void updateCurrentUserNotificationStatus(Integer locationId, Boolean enableNotifications) {
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        updateNotificationStatus(currentUserId, locationId, enableNotifications);
    }

    @Override
    @Transactional
    public void unsubscribeCurrentUserFromLocation(Integer locationId) {
        if (locationId == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        unsubscribeFromLocation(currentUserId, locationId);
    }
} 