package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketPlaceDTO {
    private Integer id;
    private Integer userId;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 3, max = 255, message = "Tên sản phẩm phải từ 3 đến 255 ký tự")
    private String productName;

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    @Size(max = 500, message = "Mô tả ngắn không được vượt quá 500 ký tự")
    private String shortDescription;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    private int quantity;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2, message = "Giá không hợp lệ")
    private BigDecimal price;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá khuyến mãi phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2, message = "Giá khuyến mãi không hợp lệ")
    private BigDecimal salePrice;
    
    private LocalDateTime saleStartDate;
    
    private LocalDateTime saleEndDate;
    
    // Ảnh đại diện chính của sản phẩm
    private String imageUrl;
    
    private String sku;
    
    private Integer categoryId;
    
    private Double weight;
    
    private String dimensions;
    
    private String sellerName;
    private Double averageRating;
    private int totalFeedbacks;
    
    // Bổ sung thuộc tính trạng thái sale
    private boolean onSale;
    
    // Giá hiện tại (sau khi áp dụng sale nếu có)
    private BigDecimal currentPrice;
    
    // Danh sách ảnh sản phẩm
    @Builder.Default
    private List<ProductImageDTO> images = new ArrayList<>();
    
    // Thêm trường giá sau giảm giá
    private BigDecimal discountedPrice;
    
    // Thêm trường tỷ lệ giảm giá
    private BigDecimal discountRate;
    
    // Ảnh đầu tiên trong danh sách hoặc ảnh đại diện
    public String getMainImageUrl() {
        // Nếu có imageUrl thì trả về
        if (imageUrl != null && !imageUrl.isEmpty()) {
            return imageUrl;
        }
        
        // Nếu có danh sách ảnh, tìm ảnh chính hoặc lấy ảnh đầu tiên
        if (images != null && !images.isEmpty()) {
            // Tìm ảnh chính (isPrimary = true)
            for (ProductImageDTO image : images) {
                if (image.isPrimary()) {
                    return image.getImageUrl();
                }
            }
            
            // Nếu không có ảnh chính, lấy ảnh đầu tiên
            return images.get(0).getImageUrl();
        }
        
        // Không có ảnh nào
        return null;
    }
    
    // Phương thức kiểm tra xem sản phẩm có ảnh không
    public boolean hasImages() {
        return (imageUrl != null && !imageUrl.isEmpty()) || 
               (images != null && !images.isEmpty());
    }
}