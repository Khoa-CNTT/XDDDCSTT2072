package com.agricultural.agricultural.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "vnpay")
public class VNPAYConfig {
    private String tmnCode;
    private String hashSecret;
    private String url;
    private String returnUrl;
    private String ipnUrl;
    private String version;
    private String command;
    private String currencyCode;
    private String locale;
} 