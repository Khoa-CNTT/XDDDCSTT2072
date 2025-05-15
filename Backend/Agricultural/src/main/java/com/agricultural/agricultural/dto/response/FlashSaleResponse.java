package com.agricultural.agricultural.dto.response;

import com.agricultural.agricultural.enums.FlashSaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private FlashSaleStatus status;
    private Integer discountPercentage;
    private BigDecimal maxDiscountAmount;
    private List<FlashSaleItemResponse> items;
} 