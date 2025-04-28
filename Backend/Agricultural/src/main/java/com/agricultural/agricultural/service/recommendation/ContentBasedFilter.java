package com.agricultural.agricultural.service.recommendation;

import com.agricultural.agricultural.entity.MarketPlace;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class ContentBasedFilter {
    
    /**
     * Tính toán độ tương đồng dựa trên thuộc tính sản phẩm
     */
    public double calculateContentSimilarity(MarketPlace product1, MarketPlace product2) {
        double similarity = 0.0;
        
        // Trọng số cho từng thuộc tính
        final double CATEGORY_WEIGHT = 0.4;
        final double PRICE_WEIGHT = 0.2;
        final double SEASON_WEIGHT = 0.4;
        
        // So sánh danh mục
        if (product1.getCategory() != null && product2.getCategory() != null &&
            product1.getCategory().equals(product2.getCategory())) {
            similarity += CATEGORY_WEIGHT;
        }
        
        // So sánh giá (chuẩn hóa khoảng cách giá)
        if (product1.getPrice() != null && product2.getPrice() != null) {
            BigDecimal priceDiff = product1.getPrice().subtract(product2.getPrice()).abs();
            BigDecimal maxPrice = product1.getPrice().max(product2.getPrice());
            
            if (maxPrice.compareTo(BigDecimal.ZERO) > 0) {
                double priceSimilarity = 1.0 - priceDiff.divide(maxPrice, 2, BigDecimal.ROUND_HALF_UP).doubleValue();
                similarity += priceSimilarity * PRICE_WEIGHT;
            }
        }
        
        // So sánh mùa vụ
        if (isInSameSeason(product1, product2)) {
            similarity += SEASON_WEIGHT;
        }
        
        return similarity;
    }
    
    /**
     * Kiểm tra hai sản phẩm có cùng mùa vụ không
     */
    private boolean isInSameSeason(MarketPlace product1, MarketPlace product2) {
        // TODO: Implement season comparison logic based on product attributes
        // Có thể dựa vào thời gian thu hoạch, thời vụ trồng, etc.
        return true;
    }
    
    /**
     * Lọc và sắp xếp sản phẩm tương tự dựa trên content
     */
    public List<MarketPlace> getContentBasedRecommendations(MarketPlace targetProduct, List<MarketPlace> allProducts, int limit) {
        return allProducts.stream()
            .filter(p -> !p.getId().equals(targetProduct.getId()))
            .sorted((p1, p2) -> Double.compare(
                calculateContentSimilarity(targetProduct, p2),
                calculateContentSimilarity(targetProduct, p1)
            ))
            .limit(limit)
            .toList();
    }
} 