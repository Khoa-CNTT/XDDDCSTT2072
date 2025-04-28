package com.agricultural.agricultural.entity.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FeedbackStatus {
    APPROVED,
    PENDING,
    REJECTED;
    
    @JsonCreator
    public static FeedbackStatus fromString(String value) {
        if (value == null) {
            return null;
        }
        
        for (FeedbackStatus status : FeedbackStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        
        // Nếu không tìm thấy, mặc định là PENDING
        return PENDING;
    }
    
    @JsonValue
    public String getValue() {
        return this.name();
    }
}
