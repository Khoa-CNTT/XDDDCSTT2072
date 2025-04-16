package com.agricultural.agricultural.dto.request;

import com.agricultural.agricultural.entity.enumeration.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    @Pattern(regexp = "^[0-9]{13,19}$", message = "Số thẻ phải có từ 13 đến 19 chữ số")
    private String cardNumber;

    @Size(max = 100, message = "Tên chủ thẻ không được vượt quá 100 ký tự")
    private String cardHolderName;

    @Pattern(regexp = "^(0[1-9]|1[0-2])/([0-9]{2})$", message = "Ngày hết hạn phải theo định dạng MM/YY")
    private String expiryDate;

    @Pattern(regexp = "^[0-9]{3,4}$", message = "Mã CVV phải có 3 hoặc 4 chữ số")
    private String cvv;

    // Thông tin ví điện tử (chỉ cần nếu phương thức là E_WALLET)
    @Size(max = 50, message = "ID ví điện tử không được vượt quá 50 ký tự")
    private String walletId;

    // Ghi chú thanh toán
    @Size(max = 255, message = "Ghi chú thanh toán không được vượt quá 255 ký tự")
    private String paymentNote;
} 