package com.agricultural.agricultural.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRequest {

    @NotBlank(message = "Mã giảm giá không được để trống")
    @Size(min = 3, max = 50, message = "Mã giảm giá phải từ 3-50 ký tự")
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    private String type; // PERCENTAGE, FIXED, FREE_SHIPPING

    @DecimalMin(value = "0.01", message = "Tỉ lệ giảm giá phải lớn hơn 0")
    @DecimalMax(value = "100.00", message = "Tỉ lệ giảm giá không được vượt quá 100%")
    private BigDecimal discountPercentage;

    @DecimalMin(value = "0.01", message = "Giá trị giảm giá phải lớn hơn 0")
    private BigDecimal maxDiscount;

    @NotNull(message = "Giá trị đơn hàng tối thiểu không được để trống")
    @DecimalMin(value = "0.00", message = "Giá trị đơn hàng tối thiểu không được âm")
    private BigDecimal minOrderValue;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;

    @Min(value = 1, message = "Giới hạn sử dụng phải lớn hơn 0")
    private Integer usageLimit;

    private Boolean userSpecific = false;
    private Integer specificUserId;

    private Boolean categorySpecific = false;
    private Integer specificCategoryId;

    private Boolean productSpecific = false;
    private Integer specificProductId;

    // Validate dữ liệu đầu vào
    public void validateData() {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        if ("FIXED".equals(type) && maxDiscount == null) {
            throw new IllegalArgumentException("Giảm giá cố định cần có giá trị giảm");
        }

        if ("PERCENTAGE".equals(type) && discountPercentage == null) {
            throw new IllegalArgumentException("Giảm giá theo phần trăm cần có tỉ lệ phần trăm");
        }

        if (userSpecific && specificUserId == null) {
            throw new IllegalArgumentException("Mã dành riêng cho người dùng cần có ID người dùng");
        }

        if (categorySpecific && specificCategoryId == null) {
            throw new IllegalArgumentException("Mã dành riêng cho danh mục cần có ID danh mục");
        }

        if (productSpecific && specificProductId == null) {
            throw new IllegalArgumentException("Mã dành riêng cho sản phẩm cần có ID sản phẩm");
        }
    }
} 