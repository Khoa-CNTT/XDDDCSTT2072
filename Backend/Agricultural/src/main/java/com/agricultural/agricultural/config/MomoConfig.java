package com.agricultural.agricultural.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "momo")
public class MomoConfig {
    private String partnerCode;
    private String partnerName;
    private String accessKey;
    private String secretKey;
    private String apiEndpoint;
    private String redirectUrl;
    private String ipnUrl;
    private String storeId;
    private String lang;
    
    // Đổi tên để phù hợp với các phương thức trong MomoPaymentService
    public String getReturnUrl() {
        return redirectUrl;
    }
    
    public String getNotifyUrl() {
        return ipnUrl;
    }
} 