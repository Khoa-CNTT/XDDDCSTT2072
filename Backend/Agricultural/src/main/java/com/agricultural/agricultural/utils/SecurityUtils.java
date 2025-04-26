package com.agricultural.agricultural.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.agricultural.agricultural.entity.User;
import org.springframework.transaction.annotation.Transactional;

public class SecurityUtils {
    
    @Transactional(readOnly = true)
    public static Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }
        
        // Lấy thông tin người dùng từ principal
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        
        throw new RuntimeException("Không thể lấy thông tin người dùng");
    }
} 