package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.common.SellerRegistrationStatus;
import com.agricultural.agricultural.dto.SellerRegistrationDTO;
import com.agricultural.agricultural.entity.SellerRegistration;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.BusinessException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.SellerRegistrationMapper;
import com.agricultural.agricultural.repository.ISellerRegistrationRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.ISellerRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SellerRegistrationServiceImpl implements ISellerRegistrationService {
    
    private final ISellerRegistrationRepository sellerRegistrationRepository;
    private final UserRepository userRepository;
    private final SellerRegistrationMapper sellerRegistrationMapper;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new BadRequestException("Không thể xác thực thông tin người dùng");
        }

        User currentUser = (User) principal;

        return currentUser;
    }

    @Override
    public SellerRegistrationDTO createRegistration(SellerRegistrationDTO registrationDTO) {
        User currentUser = getCurrentUser();
        if (sellerRegistrationRepository.existsByUserIdAndStatus(currentUser.getId(), SellerRegistrationStatus.PENDING.getValue())) {
            throw new BusinessException("Bạn đã có đơn đăng ký bán hàng đang chờ xét duyệt");
        }
        
        if (sellerRegistrationRepository.existsByUserIdAndStatusEquals(currentUser.getId(), SellerRegistrationStatus.APPROVED.getValue())) {
            throw new BusinessException("Bạn đã được phê duyệt bán hàng trước đó");
        }
        
        SellerRegistration registration = sellerRegistrationMapper.toEntity(registrationDTO, currentUser, null);
        registration.setStatus(SellerRegistrationStatus.PENDING.getValue());
        
        if (registration.getCreatedAt() == null) {
            registration.setCreatedAt(LocalDateTime.now());
        }
        
        SellerRegistration savedRegistration = sellerRegistrationRepository.save(registration);
        log.info("Đã tạo đơn đăng ký bán hàng mới cho người dùng: {}", currentUser.getUsername());
        
        return sellerRegistrationMapper.toDTO(savedRegistration);
    }
    
    @Override
    public Optional<SellerRegistrationDTO> getCurrentUserLatestRegistration() {
        User currentUser = getCurrentUser();

        return sellerRegistrationRepository.findFirstByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .map(sellerRegistrationMapper::toDTO);
    }
    
    @Override
    public List<SellerRegistrationDTO> getCurrentUserRegistrations() {
        User currentUser = getCurrentUser();

        List<SellerRegistration> registrations = sellerRegistrationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return sellerRegistrationMapper.toDTOList(registrations);
    }
    
    @Override
    @Transactional
    public SellerRegistrationDTO approveRegistration(Integer id, String notes) {
        User admin = getCurrentUser();

        SellerRegistration registration = sellerRegistrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đăng ký bán hàng"));
        
        registration.setStatus(SellerRegistrationStatus.APPROVED.getValue());
        registration.setNotes(notes);
        registration.setProcessedBy(admin);
        registration.setProcessedAt(LocalDateTime.now());
        
        SellerRegistration updatedRegistration = sellerRegistrationRepository.save(registration);
        log.info("Đã phê duyệt đơn đăng ký bán hàng cho người dùng: {}", registration.getUser().getUsername());
        
        return sellerRegistrationMapper.toDTO(updatedRegistration);
    }
    
    @Override
    @Transactional
    public SellerRegistrationDTO rejectRegistration(Integer id, String notes) {
        User admin = getCurrentUser();

        SellerRegistration registration = sellerRegistrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đăng ký bán hàng"));
        
        registration.setStatus(SellerRegistrationStatus.REJECTED.getValue());
        registration.setNotes(notes);
        registration.setProcessedBy(admin);
        registration.setProcessedAt(LocalDateTime.now());
        
        SellerRegistration updatedRegistration = sellerRegistrationRepository.save(registration);
        log.info("Đã từ chối đơn đăng ký bán hàng của người dùng: {}", registration.getUser().getUsername());
        
        return sellerRegistrationMapper.toDTO(updatedRegistration);
    }
    
    @Override
    public List<SellerRegistrationDTO> getAllRegistrations() {
        List<SellerRegistration> registrations = sellerRegistrationRepository.findAllWithUsers();
        
        for (SellerRegistration registration : registrations) {
            if (registration.getCreatedAt() == null) {
                log.warn("Registration ID {} có createdAt là null", registration.getId());
            } else {
                log.info("Registration ID {}: createdAt={}", registration.getId(), registration.getCreatedAt());
            }
        }
        
        return sellerRegistrationMapper.toDTOList(registrations);
    }
    
    @Override
    public List<SellerRegistrationDTO> getRegistrationsByStatus(String status) {
        try {
            SellerRegistrationStatus.fromValue(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Trạng thái không hợp lệ: " + status);
        }
        
        List<SellerRegistration> registrations = sellerRegistrationRepository.findByStatusWithUsers(status);
        return sellerRegistrationMapper.toDTOList(registrations);
    }
    
    @Override
    public boolean hasCurrentUserPendingRegistration() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng"));
        
        return sellerRegistrationRepository.existsByUserIdAndStatus(currentUser.getId(), SellerRegistrationStatus.PENDING.getValue());
    }
    
    @Override
    public boolean hasCurrentUserApprovedRegistration() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng"));
        
        return sellerRegistrationRepository.existsByUserIdAndStatusEquals(currentUser.getId(), SellerRegistrationStatus.APPROVED.getValue());
    }
    
    @Override
    public boolean hasUserApprovedRegistration(Integer userId) {
        return sellerRegistrationRepository.existsByUserIdAndStatusEquals(userId, SellerRegistrationStatus.APPROVED.getValue());
    }
} 