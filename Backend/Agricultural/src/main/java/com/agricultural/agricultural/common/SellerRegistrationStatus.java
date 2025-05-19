package com.agricultural.agricultural.common;

public enum SellerRegistrationStatus {
    PENDING("PENDING"),    // Đang chờ xét duyệt
    APPROVED("APPROVED"),  // Đã được chấp thuận
    REJECTED("REJECTED");  // Đã bị từ chối
    
    private final String value;
    
    SellerRegistrationStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static SellerRegistrationStatus fromValue(String value) {
        for (SellerRegistrationStatus status : SellerRegistrationStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid seller registration status: " + value);
    }
} 