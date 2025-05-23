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
    

    private String title;
    

    private String description;
    

    private String reason;
    

    private List<MarketPlaceDTO> products;
    

    private RecommendationType type;
    

    private int priority;
    

    private String icon;
    

    private String colorTag;

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