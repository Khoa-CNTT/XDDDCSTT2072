package com.agricultural.agricultural.dto.request;

import com.agricultural.agricultural.enums.FlashSaleStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleRequest {
    
    @NotBlank(message = "Tên không được để trống")
    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự")
    private String name;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    @Future(message = "Ngày bắt đầu phải là thời gian trong tương lai")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    @Future(message = "Ngày kết thúc phải là thời gian trong tương lai")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    @NotNull(message = "Trạng thái không được để trống")
    private FlashSaleStatus status;
    
    @NotNull(message = "Phần trăm giảm giá không được để trống")
    @Min(value = 1, message = "Phần trăm giảm giá tối thiểu là 1%")
    @Max(value = 100, message = "Phần trăm giảm giá tối đa là 100%")
    private Integer discountPercentage;
    
    @NotNull(message = "Số tiền giảm giá tối đa không được để trống")
    @Min(value = 0, message = "Số tiền giảm giá tối đa không được âm")
    private BigDecimal maxDiscountAmount;
} 