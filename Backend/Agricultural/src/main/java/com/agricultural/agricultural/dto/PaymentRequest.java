package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;
    
    // Thông tin thẻ (chỉ cần nếu phương thức là CREDIT_CARD)
    private String cardNumber;
    private String cardHolderName;
    private String expiryDate;
    private String cvv;
    
    // Thông tin ví điện tử (chỉ cần nếu phương thức là E_WALLET)
    private String walletId;
    
    // Ghi chú thanh toán
    private String paymentNote;
} 