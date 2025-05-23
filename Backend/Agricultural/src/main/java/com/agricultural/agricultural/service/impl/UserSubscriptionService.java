package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.UserSubscriptionDTO;
import com.agricultural.agricultural.entity.SubscriptionPlan;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.UserSubscription;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.UserSubscriptionMapper;
import com.agricultural.agricultural.repository.ISubscriptionPlanRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.repository.IUserSubscriptionRepository;
import com.agricultural.agricultural.service.IUserSubscriptionService;
import com.agricultural.agricultural.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSubscriptionService implements IUserSubscriptionService {
    
    private final IUserSubscriptionRepository userSubscriptionRepository;
    private final ISubscriptionPlanRepository subscriptionPlanRepository;
    private final IUserRepository userRepository;
    private final UserSubscriptionMapper userSubscriptionMapper;
    
    @Override
    public List<UserSubscriptionDTO> getUserSubscriptions(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }
        
        List<UserSubscription> subscriptions = userSubscriptionRepository.findByUserId(userId);
        
        return userSubscriptionMapper.toDTOList(subscriptions);
    }
    
    @Override
    public List<UserSubscriptionDTO> getActiveUserSubscriptions(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }
        
        List<UserSubscription> activeSubscriptions =
                userSubscriptionRepository.findActiveSubscriptionsByUserId(userId, LocalDateTime.now());
        
        return userSubscriptionMapper.toDTOList(activeSubscriptions);
    }
    
    @Override
    public Optional<UserSubscriptionDTO> getLatestActiveSubscription(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }
        
        return userSubscriptionRepository
                .findFirstByUserIdAndIsActiveTrueAndEndDateGreaterThanOrderByEndDateDesc(userId, LocalDateTime.now())
                .map(userSubscriptionMapper::toDTO);
    }
    
    @Override
    @Transactional
    public UserSubscriptionDTO subscribeUserToPlan(Integer userId, Integer planId, Boolean autoRenew) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (planId == null) {
            throw new BadRequestException("ID gói đăng ký không được để trống");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói đăng ký với ID: " + planId));
        
        if (!plan.getIsActive()) {
            throw new BadRequestException("Gói đăng ký này hiện không khả dụng");
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (userSubscriptionRepository.existsActiveSubscriptionByUserIdAndPlanId(userId, planId, now)) {
            throw new BadRequestException("Bạn đã đăng ký gói này và gói đang còn hiệu lực");
        }
        
        if (plan.getIsFree() && userSubscriptionRepository.existsByUserIdAndPlanId(userId, planId)) {
            throw new BadRequestException("Mỗi người dùng chỉ được đăng ký gói miễn phí một lần");
        }
        
        LocalDateTime endDate = now.plusMonths(plan.getDurationMonths());
        
        UserSubscription subscription = new UserSubscription();
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setStartDate(now);
        subscription.setEndDate(endDate);
        subscription.setPaymentAmount(plan.getPrice());
        subscription.setPaymentStatus(plan.getIsFree() ? "FREE" : "PENDING");
        subscription.setIsActive(true);
        subscription.setIsAutoRenew(autoRenew != null ? autoRenew : false);
        subscription.setLocationsUsed(0);
        
        UserSubscription savedSubscription = userSubscriptionRepository.save(subscription);
        
        return userSubscriptionMapper.toDTO(savedSubscription);
    }
    
    @Override
    @Transactional
    public void cancelSubscription(Long subscriptionId) {
        if (subscriptionId == null) {
            throw new BadRequestException("ID đăng ký không được để trống");
        }
        
        UserSubscription subscription = userSubscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký với ID: " + subscriptionId));
        
        subscription.setIsActive(false);
        userSubscriptionRepository.save(subscription);
    }
    
    @Override
    public boolean canSubscribeMoreLocations(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        Optional<UserSubscriptionDTO> latestSubscription = getLatestActiveSubscription(userId);
        
        if (latestSubscription.isEmpty()) {
            Optional<SubscriptionPlan> freePlan = subscriptionPlanRepository.findByIsActiveTrueAndIsFreeTrue();
            if (freePlan.isPresent()) {
                UserSubscriptionDTO freeSubscription = subscribeUserToPlan(userId, freePlan.get().getId(), false);
                return freeSubscription.getRemainingLocations() > 0;
            }
            return false;
        }
        
        return latestSubscription.get().getRemainingLocations() > 0;
    }
    
    @Override
    public int getRemainingLocations(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        Optional<UserSubscriptionDTO> latestSubscription = getLatestActiveSubscription(userId);
        
        if (latestSubscription.isEmpty()) {
            Optional<SubscriptionPlan> freePlan = subscriptionPlanRepository.findByIsActiveTrueAndIsFreeTrue();
            if (freePlan.isPresent()) {
                return freePlan.get().getMaxLocations();
            }
            return 0;
        }
        
        return latestSubscription.get().getRemainingLocations();
    }
    
    @Override
    @Transactional
    public void updateLocationsUsed(Integer userId, Integer locationsUsed) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (locationsUsed == null) {
            throw new BadRequestException("Số lượng địa điểm đã sử dụng không được để trống");
        }
        
        UserSubscription subscription = userSubscriptionRepository
                .findFirstByUserIdAndIsActiveTrueAndEndDateGreaterThanOrderByEndDateDesc(userId, LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Người dùng chưa có gói đăng ký nào đang hoạt động"));
        
        if (locationsUsed > subscription.getPlan().getMaxLocations()) {
            throw new BadRequestException("Số lượng địa điểm đã sử dụng vượt quá giới hạn của gói đăng ký");
        }
        
        subscription.setLocationsUsed(locationsUsed);
        userSubscriptionRepository.save(subscription);
    }
    
    @Override
    @Transactional
    public boolean incrementLocationsUsed(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (!canSubscribeMoreLocations(userId)) {
            return false;
        }
        
        UserSubscription subscription = userSubscriptionRepository
                .findFirstByUserIdAndIsActiveTrueAndEndDateGreaterThanOrderByEndDateDesc(userId, LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Người dùng chưa có gói đăng ký nào đang hoạt động"));
        
        subscription.setLocationsUsed(subscription.getLocationsUsed() + 1);
        userSubscriptionRepository.save(subscription);
        
        return true;
    }
    
    @Override
    @Transactional
    public boolean decrementLocationsUsed(Integer userId) {
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        Optional<UserSubscription> optionalSubscription = userSubscriptionRepository
                .findFirstByUserIdAndIsActiveTrueAndEndDateGreaterThanOrderByEndDateDesc(userId, LocalDateTime.now());
        
        if (optionalSubscription.isEmpty()) {
            return false;
        }
        
        UserSubscription subscription = optionalSubscription.get();
        
        if (subscription.getLocationsUsed() <= 0) {
            return false;
        }
        
        subscription.setLocationsUsed(subscription.getLocationsUsed() - 1);
        userSubscriptionRepository.save(subscription);
        
        return true;
    }
    
    @Override
    public List<UserSubscriptionDTO> getCurrentUserSubscriptions() {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        
        return getUserSubscriptions(currentUserId);
    }
    
    @Override
    public Optional<UserSubscriptionDTO> getCurrentUserActiveSubscription() {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        
        return getLatestActiveSubscription(currentUserId);
    }
    
    @Override
    @Transactional
    public UserSubscriptionDTO subscribeCurrentUserToPlan(Integer planId, Boolean autoRenew) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        
        return subscribeUserToPlan(currentUserId, planId, autoRenew);
    }
    
    @Override
    public List<UserSubscriptionDTO> getAllSubscriptions() {
        // Lấy tất cả đăng ký trong hệ thống
        List<UserSubscription> subscriptions = userSubscriptionRepository.findAll();
        
        // Chuyển đổi sang DTO và trả về
        return userSubscriptionMapper.toDTOList(subscriptions);
    }
} 