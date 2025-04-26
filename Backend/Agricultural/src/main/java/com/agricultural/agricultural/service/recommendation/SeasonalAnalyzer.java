package com.agricultural.agricultural.service.recommendation;

import com.agricultural.agricultural.entity.MarketPlace;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;

@Component
public class SeasonalAnalyzer {

    // Map lưu trữ thông tin mùa vụ của các loại nông sản
    private static final Map<String, List<Month>> CROP_SEASONS = new HashMap<>();
    
    static {
        // Ví dụ về một số mùa vụ nông sản phổ biến ở Việt Nam
        CROP_SEASONS.put("Lúa", Arrays.asList(Month.FEBRUARY, Month.MARCH, Month.JULY, Month.AUGUST));
        CROP_SEASONS.put("Rau củ", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.OCTOBER, Month.NOVEMBER, Month.DECEMBER));
        CROP_SEASONS.put("Trái cây", Arrays.asList(Month.APRIL, Month.MAY, Month.JUNE, Month.JULY));
        // Thêm các mùa vụ khác...
    }

    /**
     * Kiểm tra sản phẩm có phải đang trong mùa không
     */
    public boolean isInSeason(MarketPlace product, LocalDateTime currentTime) {
        // Kiểm tra null trước khi truy cập
        if (product.getCategory() == null) {
            return true; // Nếu không có category, coi như luôn trong mùa
        }
        
        String category = product.getCategory().getName();
        List<Month> seasonMonths = CROP_SEASONS.get(category);
        
        if (seasonMonths == null) {
            return true; // Nếu không có thông tin mùa vụ, coi như luôn trong mùa
        }
        
        return seasonMonths.contains(currentTime.getMonth());
    }

    /**
     * Tính toán điểm ưu tiên theo mùa vụ
     */
    public double calculateSeasonalScore(MarketPlace product, LocalDateTime currentTime) {
        if (isInSeason(product, currentTime)) {
            return 1.0;
        }
        
        // Tính khoảng cách đến mùa vụ tiếp theo
        if (product.getCategory() == null) {
            return 0.5; // Điểm trung bình nếu không có category
        }
        
        String category = product.getCategory().getName();
        List<Month> seasonMonths = CROP_SEASONS.get(category);
        
        if (seasonMonths == null) {
            return 0.5; // Điểm trung bình nếu không có thông tin mùa vụ
        }
        
        Month currentMonth = currentTime.getMonth();
        int minMonthsToSeason = seasonMonths.stream()
            .mapToInt(month -> {
                int diff = month.getValue() - currentMonth.getValue();
                if (diff < 0) diff += 12;
                return diff;
            })
            .min()
            .orElse(0);
            
        // Điểm giảm dần theo khoảng cách đến mùa vụ
        return Math.max(0.2, 1.0 - (minMonthsToSeason * 0.1));
    }

    /**
     * Điều chỉnh điểm gợi ý theo yếu tố mùa vụ
     */
    public double adjustRecommendationScore(double originalScore, MarketPlace product, LocalDateTime currentTime) {
        double seasonalScore = calculateSeasonalScore(product, currentTime);
        
        // Trọng số cho điểm gốc và điểm mùa vụ
        final double ORIGINAL_WEIGHT = 0.7;
        final double SEASONAL_WEIGHT = 0.3;
        
        return (originalScore * ORIGINAL_WEIGHT) + (seasonalScore * SEASONAL_WEIGHT);
    }

    /**
     * Lọc và sắp xếp lại danh sách gợi ý theo mùa vụ
     */
    public List<MarketPlace> filterAndSortBySeasonality(List<MarketPlace> recommendations, LocalDateTime currentTime) {
        return recommendations.stream()
            .sorted((p1, p2) -> Double.compare(
                calculateSeasonalScore(p2, currentTime),
                calculateSeasonalScore(p1, currentTime)
            ))
            .toList();
    }
} 