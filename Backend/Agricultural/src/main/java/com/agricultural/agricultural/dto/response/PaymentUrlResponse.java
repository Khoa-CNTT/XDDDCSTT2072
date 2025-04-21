package com.agricultural.agricultural.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Đối tượng trả về URL thanh toán và thông tin bổ sung từ cổng thanh toán
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUrlResponse {
    /**
     * URL chuyển hướng thanh toán
     */
    private String paymentUrl;

    /**
     * Mã đơn hàng tại cổng thanh toán
     */
    private String transactionId;

    /**
     * Mã đặt hàng
     */
    private Integer orderId;

    /**
     * Thông báo mô tả
     */
    private String message;

    /**
     * Thông tin bổ sung từ cổng thanh toán
     */
    private Map<String, String> additionalData;

    private String orderCode;
    private Long amount;
    private String description;
}
