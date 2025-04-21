package com.agricultural.agricultural.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentQRDTO {
    private String qrCodeBase64;  // Mã QR dạng base64
    private String paymentUrl;    // URL thanh toán
    private String orderInfo;     // Thông tin đơn hàng
    private Double amount;        // Số tiền thanh toán
    private String transactionRef; // Mã giao dịch
    private LocalDateTime expireTime; // Thời gian hết hạn
    private String bankCode;      // Mã ngân hàng nếu đã chọn
} 