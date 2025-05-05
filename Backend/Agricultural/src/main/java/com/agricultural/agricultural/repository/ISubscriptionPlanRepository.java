package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ISubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer> {
    List<SubscriptionPlan> findByIsActiveTrue();
    
    Optional<SubscriptionPlan> findByIsActiveTrueAndIsFreeTrue();
} 