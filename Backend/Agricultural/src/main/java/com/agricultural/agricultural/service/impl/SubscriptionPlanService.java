package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.SubscriptionPlanDTO;
import com.agricultural.agricultural.entity.SubscriptionPlan;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.SubscriptionPlanMapper;
import com.agricultural.agricultural.repository.ISubscriptionPlanRepository;
import com.agricultural.agricultural.service.ISubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionPlanService implements ISubscriptionPlanService {
    
    private final ISubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionPlanMapper subscriptionPlanMapper;

    @Override
    public List<SubscriptionPlanDTO> getAllPlans() {
        List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();
        return subscriptionPlanMapper.toDTOList(plans);
    }

    @Override
    public List<SubscriptionPlanDTO> getActivePlans() {
        List<SubscriptionPlan> activePlans = subscriptionPlanRepository.findByIsActiveTrue();
        return subscriptionPlanMapper.toDTOList(activePlans);
    }

    @Override
    public Optional<SubscriptionPlanDTO> getPlanById(Integer id) {
        if (id == null) {
            throw new BadRequestException("ID gói đăng ký không được để trống");
        }
        
        return subscriptionPlanRepository.findById(id)
                .map(subscriptionPlanMapper::toDTO);
    }

    @Override
    public Optional<SubscriptionPlanDTO> getFreePlan() {
        return subscriptionPlanRepository.findByIsActiveTrueAndIsFreeTrue()
                .map(subscriptionPlanMapper::toDTO);
    }

    @Override
    @Transactional
    public SubscriptionPlanDTO createPlan(SubscriptionPlanDTO planDTO) {
        if (planDTO == null) {
            throw new BadRequestException("Thông tin gói đăng ký không được để trống");
        }
        
        // Đảm bảo ID là null khi tạo mới
        planDTO.setId(null);
        
        // Chuyển đổi DTO sang entity
        SubscriptionPlan plan = subscriptionPlanMapper.toEntity(planDTO);
        
        // Lưu entity vào cơ sở dữ liệu
        SubscriptionPlan savedPlan = subscriptionPlanRepository.save(plan);
        
        // Chuyển đổi entity thành DTO và trả về
        return subscriptionPlanMapper.toDTO(savedPlan);
    }

    @Override
    @Transactional
    public SubscriptionPlanDTO updatePlan(Integer id, SubscriptionPlanDTO planDTO) {
        if (id == null) {
            throw new BadRequestException("ID gói đăng ký không được để trống");
        }
        
        if (planDTO == null) {
            throw new BadRequestException("Thông tin gói đăng ký không được để trống");
        }
        
        // Kiểm tra xem gói đăng ký có tồn tại không
        SubscriptionPlan existingPlan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói đăng ký với ID: " + id));
        
        // Cập nhật thông tin
        existingPlan.setName(planDTO.getName());
        existingPlan.setDescription(planDTO.getDescription());
        existingPlan.setPrice(planDTO.getPrice());
        existingPlan.setDurationMonths(planDTO.getDurationMonths());
        existingPlan.setMaxLocations(planDTO.getMaxLocations());
        
        if (planDTO.getIsActive() != null) {
            existingPlan.setIsActive(planDTO.getIsActive());
        }
        
        if (planDTO.getIsFree() != null) {
            existingPlan.setIsFree(planDTO.getIsFree());
        }
        
        // Lưu entity vào cơ sở dữ liệu
        SubscriptionPlan updatedPlan = subscriptionPlanRepository.save(existingPlan);
        
        // Chuyển đổi entity thành DTO và trả về
        return subscriptionPlanMapper.toDTO(updatedPlan);
    }

    @Override
    @Transactional
    public SubscriptionPlanDTO togglePlanStatus(Integer id, boolean active) {
        if (id == null) {
            throw new BadRequestException("ID gói đăng ký không được để trống");
        }
        
        // Kiểm tra xem gói đăng ký có tồn tại không
        SubscriptionPlan existingPlan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói đăng ký với ID: " + id));
        
        // Cập nhật trạng thái
        existingPlan.setIsActive(active);
        
        // Lưu entity vào cơ sở dữ liệu
        SubscriptionPlan updatedPlan = subscriptionPlanRepository.save(existingPlan);
        
        // Chuyển đổi entity thành DTO và trả về
        return subscriptionPlanMapper.toDTO(updatedPlan);
    }

    @Override
    @Transactional
    public void deletePlan(Integer id) {
        if (id == null) {
            throw new BadRequestException("ID gói đăng ký không được để trống");
        }
        
        // Kiểm tra xem gói đăng ký có tồn tại không
        if (!subscriptionPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy gói đăng ký với ID: " + id);
        }
        
        // Xóa gói đăng ký
        subscriptionPlanRepository.deleteById(id);
    }
} 