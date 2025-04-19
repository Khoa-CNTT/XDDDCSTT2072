package com.agricultural.agricultural.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Đối tượng yêu cầu hoàn tiền cho đơn hàng
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RefundRequest {
    @NotBlank(message = "Mã giao dịch không được để trống")
    private String transactionId;
    
    @NotNull(message = "Số tiền hoàn trả không được để trống")
    @Positive(message = "Số tiền hoàn trả phải lớn hơn 0")
    private Long amount;
    
    @NotBlank(message = "Lý do hoàn tiền không được để trống")
    private String reason;
    
    private Long orderId;
} 