package com.agricultural.agricultural.dto.momo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomoQRResponse {
    private String partnerCode;
    private String requestId;
    private String orderId;
    private String amount;
    private String responseTime;
    private String message;
    private String resultCode;
    private String payUrl;
    private String qrCodeUrl;
    private String deeplink;
    private String deeplinkMiniApp;
    private String signature;
} 