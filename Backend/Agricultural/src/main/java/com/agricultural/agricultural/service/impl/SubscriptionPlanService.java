package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.SubscriptionPlanDTO;
import com.agricultural.agricultural.entity.SubscriptionPlan;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.SubscriptionPlanMapper;
import com.agricultural.agricultural.repository.ISubscriptionPlanRepository;
import com.agricultural.agricultural.service.ISubscriptionPlanService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
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
            throw new ResourceNotFoundException("ID gói đăng ký không được để trống");
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
            throw new ResourceNotFoundException("Thông tin gói đăng ký không được để trống");
        }
        
        // Thiết lập giá trị mặc định nếu chưa có
        if (planDTO.getIsActive() == null) {
            planDTO.setIsActive(true);
        }
        
        SubscriptionPlan plan = subscriptionPlanMapper.toEntity(planDTO);
        
        // Lưu vào cơ sở dữ liệu
        SubscriptionPlan savedPlan = subscriptionPlanRepository.save(plan);
        
        // Trả về DTO đã được cập nhật
        return subscriptionPlanMapper.toDTO(savedPlan);
    }
    
    @Override
    @Transactional
    public SubscriptionPlanDTO updatePlan(Integer id, SubscriptionPlanDTO planDTO) {
        if (id == null) {
            throw new ResourceNotFoundException("ID gói đăng ký không được để trống");
        }
        
        if (planDTO == null) {
            throw new ResourceNotFoundException("Thông tin gói đăng ký không được để trống");
        }
        
        // Kiểm tra gói đăng ký có tồn tại không
        SubscriptionPlan existingPlan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói đăng ký với ID: " + id));
        
        // Cập nhật thông tin
        existingPlan.setName(planDTO.getName());
        existingPlan.setDescription(planDTO.getDescription());
        existingPlan.setPrice(planDTO.getPrice());
        existingPlan.setDurationMonths(planDTO.getDurationMonths());
        existingPlan.setMaxLocations(planDTO.getMaxLocations());
        existingPlan.setIsActive(planDTO.getIsActive());
        existingPlan.setIsFree(planDTO.getIsFree());
        
        // Cập nhật các quyền mới
        if (planDTO.getCanSellProducts() != null) {
            existingPlan.setCanSellProducts(planDTO.getCanSellProducts());
        }
        if (planDTO.getCanAccessForum() != null) {
            existingPlan.setCanAccessForum(planDTO.getCanAccessForum());
        }
        if (planDTO.getCanPurchaseProducts() != null) {
            existingPlan.setCanPurchaseProducts(planDTO.getCanPurchaseProducts());
        }
        if (planDTO.getCanUseAIChat() != null) {
            existingPlan.setCanUseAIChat(planDTO.getCanUseAIChat());
        }
        
        // Lưu vào cơ sở dữ liệu
        SubscriptionPlan updatedPlan = subscriptionPlanRepository.save(existingPlan);
        
        // Trả về DTO đã được cập nhật
        return subscriptionPlanMapper.toDTO(updatedPlan);
    }
    
    @Override
    @Transactional
    public SubscriptionPlanDTO togglePlanStatus(Integer id, boolean active) {
        if (id == null) {
            throw new ResourceNotFoundException("ID gói đăng ký không được để trống");
        }
        
        // Kiểm tra gói đăng ký có tồn tại không
        SubscriptionPlan existingPlan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói đăng ký với ID: " + id));
        
        // Cập nhật trạng thái
        existingPlan.setIsActive(active);
        
        // Lưu vào cơ sở dữ liệu
        SubscriptionPlan updatedPlan = subscriptionPlanRepository.save(existingPlan);
        
        // Trả về DTO đã được cập nhật
        return subscriptionPlanMapper.toDTO(updatedPlan);
    }
    
    @Override
    @Transactional
    public void deletePlan(Integer id) {
        if (id == null) {
            throw new ResourceNotFoundException("ID gói đăng ký không được để trống");
        }
        
        // Kiểm tra gói đăng ký có tồn tại không
        if (!subscriptionPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy gói đăng ký với ID: " + id);
        }
        
        // Xóa khỏi cơ sở dữ liệu
        subscriptionPlanRepository.deleteById(id);
    }
    
    /**
     * Phương thức tạo các gói đăng ký mặc định nếu chưa có
     * Được gọi sau khi khởi tạo Service
     */
    @PostConstruct
    @Transactional
    public void initDefaultPlans() {
        log.info("Kiểm tra và khởi tạo các gói đăng ký mặc định");
        
        // Kiểm tra xem đã có gói nào chưa
        if (subscriptionPlanRepository.count() == 0) {
            log.info("Chưa có gói đăng ký nào, tiến hành tạo mặc định");
            
            // Tạo gói Free
            SubscriptionPlan freePlan = new SubscriptionPlan();
            freePlan.setName("Gói Free");
            freePlan.setDescription("Gói miễn phí cho phép tham gia diễn đàn, mua sản phẩm và sử dụng AI chat");
            freePlan.setPrice(BigDecimal.ZERO);
            freePlan.setDurationMonths(12); // 1 năm
            freePlan.setMaxLocations(3);    // Cho phép theo dõi 3 địa điểm
            freePlan.setIsActive(true);
            freePlan.setIsFree(true);
            
            // Thiết lập quyền cho gói Free
            freePlan.setCanSellProducts(false);        // Không được bán hàng
            freePlan.setCanAccessForum(true);          // Được tham gia diễn đàn
            freePlan.setCanPurchaseProducts(true);     // Được mua hàng
            freePlan.setCanUseAIChat(true);            // Được sử dụng AI chat
            
            subscriptionPlanRepository.save(freePlan);
            log.info("Đã tạo gói Free mặc định");
            
            // Tạo gói Premium
            SubscriptionPlan premiumPlan = new SubscriptionPlan();
            premiumPlan.setName("Gói Premium");
            premiumPlan.setDescription("Gói cao cấp cho phép đăng ký bán hàng (cần được admin phê duyệt)");
            premiumPlan.setPrice(new BigDecimal("500000")); // 500.000 VND
            premiumPlan.setDurationMonths(12);         // 1 năm
            premiumPlan.setMaxLocations(10);           // Cho phép theo dõi 10 địa điểm
            premiumPlan.setIsActive(true);
            premiumPlan.setIsFree(false);
            
            // Thiết lập quyền cho gói Premium
            premiumPlan.setCanSellProducts(true);      // Được bán hàng (cần admin phê duyệt)
            premiumPlan.setCanAccessForum(true);       // Được tham gia diễn đàn
            premiumPlan.setCanPurchaseProducts(true);  // Được mua hàng
            premiumPlan.setCanUseAIChat(true);         // Được sử dụng AI chat
            
            subscriptionPlanRepository.save(premiumPlan);
            log.info("Đã tạo gói Premium mặc định");
        } else {
            log.info("Đã có gói đăng ký trong hệ thống, không cần tạo mặc định");
        }
    }
}