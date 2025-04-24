package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO chứa thông tin gợi ý sản phẩm theo mùa vụ và thời tiết
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonalRecommendationDTO {
    
    /**
     * Tiêu đề của gợi ý
     */
    private String title;
    
    /**
     * Mô tả chi tiết về gợi ý
     */
    private String description;
    
    /**
     * Lý do gợi ý (dựa trên thời tiết, mùa vụ, v.v.)
     */
    private String reason;
    
    /**
     * Danh sách sản phẩm được gợi ý
     */
    private List<MarketPlaceDTO> products;
    
    /**
     * Loại gợi ý (VD: theo mùa, theo thời tiết, khuyến mãi, v.v.)
     */
    private RecommendationType type;
    
    /**
     * Độ ưu tiên của gợi ý (để sắp xếp khi hiển thị)
     */
    private int priority;
    
    /**
     * Icon hoặc hình ảnh đại diện cho gợi ý
     */
    private String icon;
    
    /**
     * Thẻ màu để hiển thị trên UI
     */
    private String colorTag;
    
    /**
     * Các loại gợi ý
     */
    public enum RecommendationType {
        SEASONAL("Theo mùa vụ"),
        WEATHER("Theo thời tiết"),
        PROMOTION("Khuyến mãi"),
        TRENDING("Xu hướng"),
        PLANTING("Trồng trọt"),
        HARVESTING("Thu hoạch"),
        SPECIAL_EVENT("Sự kiện đặc biệt");
        
        private final String displayName;
        
        RecommendationType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
} 