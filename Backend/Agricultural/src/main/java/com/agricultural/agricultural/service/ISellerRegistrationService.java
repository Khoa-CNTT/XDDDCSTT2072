package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.SellerRegistrationDTO;

import java.util.List;
import java.util.Optional;

public interface ISellerRegistrationService {
    

    SellerRegistrationDTO createRegistration(SellerRegistrationDTO registrationDTO);
    

    Optional<SellerRegistrationDTO> getCurrentUserLatestRegistration();
    

    List<SellerRegistrationDTO> getCurrentUserRegistrations();
    

    SellerRegistrationDTO approveRegistration(Integer id, String notes);
    

    SellerRegistrationDTO rejectRegistration(Integer id, String notes);
    

    List<SellerRegistrationDTO> getAllRegistrations();
    

    List<SellerRegistrationDTO> getRegistrationsByStatus(String status);
    

    boolean hasCurrentUserPendingRegistration();
    

    boolean hasCurrentUserApprovedRegistration();
    

    boolean hasUserApprovedRegistration(Integer userId);
} 