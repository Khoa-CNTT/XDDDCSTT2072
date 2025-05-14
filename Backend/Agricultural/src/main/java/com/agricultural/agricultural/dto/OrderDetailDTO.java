package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.OrderStatus;
import com.agricultural.agricultural.entity.enumeration.ReviewStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDTO {
    private Integer id;
    private Integer orderId;
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productId;
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;
    
    private String productImage;
    
    private Integer variantId;
    
    private String variantName;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
    
    @NotNull(message = "Giá không được để trống")
    @PositiveOrZero(message = "Giá không được âm")
    private BigDecimal price;
    
    @PositiveOrZero(message = "Giá gốc không được âm")
    private BigDecimal originalPrice;
    
    @PositiveOrZero(message = "Giảm giá không được âm")
    private BigDecimal discountAmount;
    
    @PositiveOrZero(message = "Tổng tiền không được âm")
    private BigDecimal totalPrice;
    
    @NotNull(message = "Trạng thái không được để trống")
    private OrderStatus status;
    
    private ReviewStatus reviewStatus;
} 