package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.SubscriptionPlanDTO;
import com.agricultural.agricultural.service.ISubscriptionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/subscription-plans")
@RequiredArgsConstructor
public class SubscriptionPlanController {
    
    private final ISubscriptionPlanService subscriptionPlanService;
    
    /**
     * Lấy tất cả các gói đăng ký đang hoạt động
     */
    @GetMapping("/active")
    public ResponseEntity<List<SubscriptionPlanDTO>> getActivePlans() {
        return ResponseEntity.ok(subscriptionPlanService.getActivePlans());
    }
    
    /**
     * Lấy thông tin gói đăng ký theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlanById(@PathVariable String id) {
        try {
            Integer planId = Integer.parseInt(id);
            return subscriptionPlanService.getPlanById(planId)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Lấy gói miễn phí
     */
    @GetMapping("/free")
    public ResponseEntity<SubscriptionPlanDTO> getFreePlan() {
        return subscriptionPlanService.getFreePlan()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // ========== API dành cho Admin ==========
    
    /**
     * Lấy tất cả các gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @GetMapping
    public ResponseEntity<List<SubscriptionPlanDTO>> getAllPlans() {
        return ResponseEntity.ok(subscriptionPlanService.getAllPlans());
    }
    
    /**
     * Tạo gói đăng ký mới
     * Chỉ Admin mới có quyền truy cập
     */
    @PostMapping
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> createPlan(@Valid @RequestBody SubscriptionPlanDTO planDTO) {
        try {
            SubscriptionPlanDTO createdPlan = subscriptionPlanService.createPlan(planDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Cập nhật thông tin gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> updatePlan(
            @PathVariable String id, 
            @Valid @RequestBody SubscriptionPlanDTO planDTO) {
        try {
            Integer planId = Integer.parseInt(id);
            SubscriptionPlanDTO updatedPlan = subscriptionPlanService.updatePlan(planId, planDTO);
            return ResponseEntity.ok(updatedPlan);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Kích hoạt/vô hiệu hóa gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> togglePlanStatus(
            @PathVariable String id,
            @RequestParam Boolean active) {
        try {
            Integer planId = Integer.parseInt(id);
            SubscriptionPlanDTO updatedPlan = subscriptionPlanService.togglePlanStatus(planId, active);
            return ResponseEntity.ok(updatedPlan);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    /**
     * Xóa gói đăng ký
     * Chỉ Admin mới có quyền truy cập
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        try {
            Integer planId = Integer.parseInt(id);
            subscriptionPlanService.deletePlan(planId);
            return ResponseEntity.noContent().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
} 