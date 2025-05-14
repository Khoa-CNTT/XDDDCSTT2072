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
        // Các mùa vụ nông sản phổ biến ở Việt Nam
        CROP_SEASONS.put("Lúa", Arrays.asList(Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.JULY, Month.AUGUST, Month.SEPTEMBER));
        CROP_SEASONS.put("Rau củ", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.OCTOBER, Month.NOVEMBER, Month.DECEMBER));
        CROP_SEASONS.put("Trái cây", Arrays.asList(Month.APRIL, Month.MAY, Month.JUNE, Month.JULY, Month.AUGUST, Month.SEPTEMBER));
        CROP_SEASONS.put("Hoa", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.NOVEMBER, Month.DECEMBER));
        
        // Thêm chi tiết hơn cho từng loại sản phẩm - đảm bảo luôn có sản phẩm trong mùa
        CROP_SEASONS.put("Hạt giống", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE, Month.JULY, Month.AUGUST, Month.SEPTEMBER, Month.OCTOBER, Month.NOVEMBER, Month.DECEMBER)); // Hạt giống cần quanh năm
        CROP_SEASONS.put("Phân bón", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE, Month.JULY, Month.AUGUST, Month.SEPTEMBER, Month.OCTOBER, Month.NOVEMBER, Month.DECEMBER)); // Phân bón cần quanh năm
        CROP_SEASONS.put("Thiết bị", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE, Month.JULY, Month.AUGUST, Month.SEPTEMBER, Month.OCTOBER, Month.NOVEMBER, Month.DECEMBER)); // Thiết bị cần quanh năm
        CROP_SEASONS.put("Bảo quản", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE, Month.JULY, Month.AUGUST, Month.SEPTEMBER, Month.OCTOBER, Month.NOVEMBER, Month.DECEMBER)); // Vật tư bảo quản cần quanh năm
        
        // Thêm các mùa vụ cụ thể
        CROP_SEASONS.put("Cây giống", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.JULY, Month.AUGUST, Month.SEPTEMBER, Month.OCTOBER));
        CROP_SEASONS.put("Thuốc BVTV", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE, Month.JULY, Month.AUGUST, Month.SEPTEMBER, Month.OCTOBER, Month.NOVEMBER, Month.DECEMBER));
        
        // Thêm một số loại cây trồng cụ thể
        CROP_SEASONS.put("Dưa hấu", Arrays.asList(Month.APRIL, Month.MAY, Month.JUNE, Month.JULY));
        CROP_SEASONS.put("Xoài", Arrays.asList(Month.APRIL, Month.MAY, Month.JUNE));
        CROP_SEASONS.put("Cà chua", Arrays.asList(Month.MARCH, Month.APRIL, Month.MAY, Month.OCTOBER, Month.NOVEMBER));
        CROP_SEASONS.put("Ớt", Arrays.asList(Month.APRIL, Month.MAY, Month.JUNE, Month.JULY, Month.AUGUST));
        CROP_SEASONS.put("Cà rốt", Arrays.asList(Month.JANUARY, Month.FEBRUARY, Month.NOVEMBER, Month.DECEMBER));
        CROP_SEASONS.put("Khoai tây", Arrays.asList(Month.FEBRUARY, Month.MARCH, Month.SEPTEMBER, Month.OCTOBER));
        CROP_SEASONS.put("Bắp cải", Arrays.asList(Month.NOVEMBER, Month.DECEMBER, Month.JANUARY, Month.FEBRUARY));
        
        // Thêm sản phẩm theo mùa
        CROP_SEASONS.put("Sản phẩm mùa xuân", Arrays.asList(Month.FEBRUARY, Month.MARCH, Month.APRIL));
        CROP_SEASONS.put("Sản phẩm mùa hè", Arrays.asList(Month.MAY, Month.JUNE, Month.JULY));
        CROP_SEASONS.put("Sản phẩm mùa thu", Arrays.asList(Month.AUGUST, Month.SEPTEMBER, Month.OCTOBER));
        CROP_SEASONS.put("Sản phẩm mùa đông", Arrays.asList(Month.NOVEMBER, Month.DECEMBER, Month.JANUARY));
    }

    /**
     * Kiểm tra sản phẩm có phải đang trong mùa không
     */
    public boolean isInSeason(MarketPlace product, LocalDateTime currentTime) {
        // Kiểm tra null trước khi truy cập
        if (product == null) {
            return true; // Nếu không có thông tin sản phẩm, coi như luôn trong mùa
        }
        
        if (product.getCategory() == null) {
            return true; // Nếu không có category, coi như luôn trong mùa
        }
        
        String category = product.getCategory().getName();
        List<Month> seasonMonths = CROP_SEASONS.get(category);
        
        if (seasonMonths == null) {
            // Kiểm tra tên sản phẩm nếu có
            if (product.getProductName() != null) {
                String productName = product.getProductName().toLowerCase();
                
                // Duyệt qua các từ khóa mùa vụ
                for (Map.Entry<String, List<Month>> entry : CROP_SEASONS.entrySet()) {
                    if (productName.contains(entry.getKey().toLowerCase())) {
                        seasonMonths = entry.getValue();
                        break;
                    }
                }
            }
            
            // Nếu không tìm thấy theo tên, kiểm tra category
            if (seasonMonths == null) {
                for (Map.Entry<String, List<Month>> entry : CROP_SEASONS.entrySet()) {
                    if (category.toLowerCase().contains(entry.getKey().toLowerCase())) {
                        seasonMonths = entry.getValue();
                        break;
                    }
                }
            
                // Nếu vẫn không tìm thấy, coi như luôn trong mùa
                if (seasonMonths == null) {
                    return true;
                }
            }
        }
        
        // Kiểm tra tháng hiện tại có nằm trong mùa vụ không
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