package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.SubscriptionPlanDTO;

import java.util.List;
import java.util.Optional;

public interface ISubscriptionPlanService {

    List<SubscriptionPlanDTO> getAllPlans();
    

    List<SubscriptionPlanDTO> getActivePlans();
    

    Optional<SubscriptionPlanDTO> getPlanById(Integer id);
    

    Optional<SubscriptionPlanDTO> getFreePlan();
    

    SubscriptionPlanDTO createPlan(SubscriptionPlanDTO planDTO);
    

    SubscriptionPlanDTO updatePlan(Integer id, SubscriptionPlanDTO planDTO);
    

    SubscriptionPlanDTO togglePlanStatus(Integer id, boolean active);
    

    void deletePlan(Integer id);
} 