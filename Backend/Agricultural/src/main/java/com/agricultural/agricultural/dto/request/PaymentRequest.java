package com.agricultural.agricultural.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;
    @NotNull(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
    
    @NotNull(message = "Số tiền thanh toán không được để trống")
    @Positive(message = "Số tiền thanh toán phải lớn hơn 0")
    private Long amount;
    
    private String description;
    private String returnUrl;
    // Thông tin bổ sung
    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;
    private String clientIp; // Địa chỉ IP của người dùng, cần thiết cho VNPAY
    
    // Danh sách các mặt hàng trong đơn hàng (cho thanh toán nhiều mặt hàng)
    private List<Item> items;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Item {
        private String name;      // Tên sản phẩm
        private int quantity;     // Số lượng
        private long price;       // Giá sản phẩm (đơn vị VND)
        private String productId; // ID của sản phẩm
    }
} 