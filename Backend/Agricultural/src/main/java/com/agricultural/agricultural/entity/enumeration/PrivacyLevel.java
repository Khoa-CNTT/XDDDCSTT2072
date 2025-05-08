package com.agricultural.agricultural.entity.enumeration;

/**
 * Enum định nghĩa các mức độ riêng tư cho bài đăng forum
 */
public enum PrivacyLevel {
    /**
     * Công khai - Mọi người đều có thể xem
     */
    PUBLIC("Công khai"),
    
    /**
     * Chỉ hiển thị cho những người đã kết nối
     */
    CONNECTIONS("Kết nối"),
    
    /**
     * Chỉ riêng người đăng có thể xem
     */
    PRIVATE("Riêng tư");
    
    private final String displayName;
    
    PrivacyLevel(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return this.displayName;
    }
} 