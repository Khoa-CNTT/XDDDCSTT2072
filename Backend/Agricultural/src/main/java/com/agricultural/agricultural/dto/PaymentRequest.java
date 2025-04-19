package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    @NotNull(message = "Mã đơn hàng không thể trống")
    private Long orderId;
    
    @NotNull(message = "Số tiền không thể trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private Long amount;
    
    @NotBlank(message = "Phương thức thanh toán không thể trống")
    private String paymentMethod;
    
    @NotBlank(message = "Mô tả không thể trống")
    private String description;
    
    private String buyerName;
    
    private String buyerEmail;
    
    private String buyerPhone;
} 