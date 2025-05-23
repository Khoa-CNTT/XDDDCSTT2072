package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.SeasonalRecommendationDTO;
import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.service.IMarketPlaceWeatherService;
import com.agricultural.agricultural.service.IProductRecommendationService;
import com.agricultural.agricultural.service.IWeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/weather-recommendations")
@RequiredArgsConstructor
@Slf4j
public class ProductWeatherRecommendationController {

    private final IWeatherService weatherService;
    private final IProductRecommendationService recommendationService;
    private final IMarketPlaceWeatherService marketPlaceWeatherService;


    @GetMapping("/by-weather")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductsByWeather(
            @RequestParam String city,
            @RequestParam String country,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm theo thời tiết - thành phố: {}, quốc gia: {}", city, country);
        
        WeatherDataDTO weatherData = weatherService.getCurrentWeather(city, country);
        
        // Lấy sản phẩm theo mùa vụ
        Pageable pageable = PageRequest.of(page, size);
        Page<MarketPlaceDTO> seasonalProducts = recommendationService.getSeasonalProducts(pageable);
        
        // Kiểm tra nếu không có sản phẩm theo mùa vụ
        if (seasonalProducts == null || seasonalProducts.isEmpty()) {
            log.warn("Không tìm thấy sản phẩm theo mùa vụ, thử lấy sản phẩm theo thời tiết");
            

            List<MarketPlaceDTO> weatherBasedProducts = marketPlaceWeatherService.getProductsForCurrentWeather(city, country);
            
            if (weatherBasedProducts != null && !weatherBasedProducts.isEmpty()) {
                log.info("Tìm thấy {} sản phẩm theo thời tiết", weatherBasedProducts.size());
                
                // Tạo page từ list
                int start = (int) pageable.getOffset();
                int end = Math.min((start + pageable.getPageSize()), weatherBasedProducts.size());
                
                List<MarketPlaceDTO> pagedProducts = weatherBasedProducts.subList(
                    Math.min(start, weatherBasedProducts.size()), 
                    Math.min(end, weatherBasedProducts.size())
                );
                
                seasonalProducts = new PageImpl<>(pagedProducts, pageable, weatherBasedProducts.size());
            } else {
                log.warn("Không tìm thấy sản phẩm nào theo thời tiết, lấy tất cả sản phẩm từ database");
                
                Page<MarketPlaceDTO> allProducts = recommendationService.getTrendingProducts(pageable);
                
                if (allProducts == null || allProducts.isEmpty()) {
                    log.warn("Không tìm thấy sản phẩm nào trong database, tạo page rỗng");
                    seasonalProducts = Page.empty(pageable);
                } else {
                    log.info("Lấy {} sản phẩm từ database", allProducts.getTotalElements());
                    seasonalProducts = allProducts;
                }
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("weatherData", weatherData);
        result.put("seasonalProducts", seasonalProducts);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm theo thời tiết thành công", result));
    }


    @GetMapping("/rainy-season")
    public ResponseEntity<ApiResponse<Page<MarketPlaceDTO>>> getRainySeasonProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm mùa mưa - trang: {}, kích thước: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        // Lấy sản phẩm theo mùa mưa (có thể mở rộng service để hỗ trợ)
        Page<MarketPlaceDTO> products = recommendationService.getSeasonalProducts(pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm mùa mưa thành công", products));
    }


    @GetMapping("/dry-season")
    public ResponseEntity<ApiResponse<Page<MarketPlaceDTO>>> getDrySeasonProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm mùa khô - trang: {}, kích thước: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        // Lấy sản phẩm theo mùa khô (có thể mở rộng service để hỗ trợ)
        Page<MarketPlaceDTO> products = recommendationService.getTrendingProducts(pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm mùa khô thành công", products));
    }


    @GetMapping("/upcoming-season")
    public ResponseEntity<ApiResponse<Page<MarketPlaceDTO>>> getUpcomingSeasonProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm sắp vào mùa vụ - trang: {}, kích thước: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MarketPlaceDTO> products = recommendationService.getUpcomingSeasonalProducts(pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm sắp vào mùa vụ thành công", products));
    }


    @GetMapping("/home-dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHomeDashboard(
            @RequestParam String city,
            @RequestParam String country) {
        
        log.info("Lấy thông tin dashboard trang chủ - thành phố: {}, quốc gia: {}", city, country);
        
        // Lấy thông tin thời tiết
        WeatherDataDTO weatherData = weatherService.getCurrentWeather(city, country);
        
        // Lấy lời khuyên nông nghiệp
        var agriculturalAdvice = weatherService.getLatestAgriculturalAdvice(city, country);
        
        // Lấy các loại sản phẩm gợi ý
        Pageable pageable = PageRequest.of(0, 5);
        Page<MarketPlaceDTO> seasonalProducts = recommendationService.getSeasonalProducts(pageable);
        Page<MarketPlaceDTO> trendingProducts = recommendationService.getTrendingProducts(pageable);
        Page<MarketPlaceDTO> upcomingProducts = recommendationService.getUpcomingSeasonalProducts(pageable);
        
        // Tổng hợp dữ liệu
        Map<String, Object> result = new HashMap<>();
        result.put("weatherData", weatherData);
        result.put("agriculturalAdvice", agriculturalAdvice.orElse(null));
        result.put("seasonalProducts", seasonalProducts);
        result.put("trendingProducts", trendingProducts);
        result.put("upcomingProducts", upcomingProducts);
        
        // Thêm mô tả marketing dựa vào thời tiết
        String marketingMessage = generateMarketingMessage(weatherData);
        result.put("marketingMessage", marketingMessage);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin dashboard thành công", result));
    }
    

    private String generateMarketingMessage(WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        
        if (description.contains("mưa") || description.contains("rain")) {
            return "Trời đang mưa! Đây là thời điểm tốt để mua các sản phẩm cho mùa mưa như hạt giống rau xanh, phân bón và các dụng cụ thoát nước.";
        } else if (temperature > 30) {
            return "Trời nắng nóng! Hãy xem các sản phẩm tưới tiêu tự động, che phủ và chăm sóc cây trồng mùa khô.";
        } else if (humidity < 40) {
            return "Độ ẩm thấp! Khám phá các sản phẩm giữ ẩm, phun sương và chăm sóc vườn tược hiệu quả.";
        } else if (description.contains("nắng") || description.contains("sun") || description.contains("clear")) {
            return "Ngày nắng đẹp! Hãy tận dụng thời tiết thuận lợi với các sản phẩm trồng trọt và chăm sóc vườn của chúng tôi.";
        } else {
            return "Khám phá các sản phẩm nông nghiệp phù hợp với mùa vụ hiện tại!";
        }
    }


    @GetMapping("/detailed-recommendations")
    public ResponseEntity<ApiResponse<List<SeasonalRecommendationDTO>>> getDetailedRecommendations(
            @RequestParam String city,
            @RequestParam String country) {
        
        log.info("Lấy danh sách gợi ý chi tiết - thành phố: {}, quốc gia: {}", city, country);
        
        List<SeasonalRecommendationDTO> recommendations = marketPlaceWeatherService.getDetailedRecommendations(city, country);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gợi ý chi tiết thành công", recommendations));
    }
    

    @GetMapping("/seasonal-promotions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSeasonalPromotions(
            @RequestParam String city,
            @RequestParam String country) {
        
        log.info("Lấy khuyến mãi theo mùa vụ - thành phố: {}, quốc gia: {}", city, country);
        
        Map<String, Object> promotions = marketPlaceWeatherService.getSeasonalPromotions(city, country);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin khuyến mãi theo mùa vụ thành công", promotions));
    }
    

    @GetMapping("/by-crop")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductsByCropAndWeather(
            @RequestParam String city,
            @RequestParam String country,
            @RequestParam String cropType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm theo cây trồng và thời tiết - thành phố: {}, quốc gia: {}, loại cây: {}", 
                city, country, cropType);
        
        // Lấy thông tin thời tiết hiện tại và dự báo
        WeatherDataDTO currentWeather = weatherService.getCurrentWeather(city, country);
        
        // Lấy sản phẩm phù hợp cho loại cây trồng dựa trên thời tiết
        Pageable pageable = PageRequest.of(page, size);
        Page<MarketPlaceDTO> cropProducts = marketPlaceWeatherService.getProductsByCropAndWeather(
                cropType, currentWeather, pageable);
        
        // Lấy lời khuyên chăm sóc cho loại cây trồng này dưới điều kiện thời tiết hiện tại
        String careAdvice = generateCropCareAdvice(cropType, currentWeather);
        
        Map<String, Object> result = new HashMap<>();
        result.put("weatherData", currentWeather);
        result.put("cropProducts", cropProducts);
        result.put("careAdvice", careAdvice);
        
        return ResponseEntity.ok(new ApiResponse<>(true, 
                "Lấy danh sách sản phẩm theo cây trồng và thời tiết thành công", result));
    }
    
    /**
     * Tạo lời khuyên chăm sóc cây trồng dựa trên loại cây và thời tiết
     */
    private String generateCropCareAdvice(String cropType, WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        
        switch(cropType.toLowerCase()) {
            case "lúa":
                if (description.contains("mưa")) {
                    return "Thời tiết mưa hiện tại phù hợp cho lúa, nhưng cần lưu ý kiểm soát mực nước và phòng bệnh đạo ôn.";
                } else if (temperature > 35) {
                    return "Nhiệt độ cao, cần chú ý cung cấp đủ nước và che chắn cho lúa. Nên tưới vào buổi sáng sớm hoặc chiều muộn.";
                }
                return "Đảm bảo cung cấp đủ nước và phân bón cho lúa trong giai đoạn phát triển hiện tại.";
                
            case "rau":
                if (description.contains("mưa")) {
                    return "Thời tiết mưa có thể gây ngập úng và bệnh nấm. Cần thoát nước tốt và phun thuốc phòng bệnh cho rau.";
                } else if (temperature > 32) {
                    return "Nhiệt độ cao có thể gây stress cho rau. Nên che phủ, tưới đủ nước và bón phân cân đối.";
                }
                return "Điều kiện thời tiết hiện tại phù hợp cho việc trồng rau. Duy trì chế độ chăm sóc đều đặn.";
                
            case "cây ăn quả":
                if (description.contains("mưa")) {
                    return "Mưa nhiều có thể gây rụng hoa quả và bệnh nấm. Cần thoát nước tốt và phun thuốc phòng bệnh.";
                } else if (temperature > 35) {
                    return "Nhiệt độ cao có thể ảnh hưởng đến quá trình ra hoa kết quả. Cần che bóng và tưới đủ nước.";
                } else if (humidity < 40) {
                    return "Độ ẩm thấp, cần tăng cường tưới nước cho cây ăn quả, đặc biệt là thời kỳ ra hoa, đậu quả.";
                }
                return "Điều kiện thời tiết hiện tại phù hợp cho cây ăn quả. Duy trì chế độ chăm sóc thường xuyên.";
                
            default:
                return "Hãy điều chỉnh chế độ chăm sóc phù hợp với điều kiện thời tiết hiện tại để đảm bảo cây trồng phát triển tốt.";
        }
    }
    

    @GetMapping("/extreme-weather-preparation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExtremeWeatherPreparation(
            @RequestParam String city,
            @RequestParam String country,
            @RequestParam(defaultValue = "7") int forecastDays) {
        
        log.info("Lấy gợi ý chuẩn bị cho thời tiết khắc nghiệt - thành phố: {}, quốc gia: {}, dự báo: {} ngày", 
                city, country, forecastDays);
        
        // Xác định các hiện tượng thời tiết khắc nghiệt sắp xảy ra (bão, lũ, hạn hán, sương muối...)
        Map<String, Object> extremeWeather = weatherService.predictExtremeWeather(city, country, forecastDays);
        
        // Lấy danh sách sản phẩm phù hợp cho từng loại thời tiết khắc nghiệt
        Map<String, List<MarketPlaceDTO>> preparationProducts = 
                marketPlaceWeatherService.getProductsForExtremeWeather(extremeWeather);
        
        // Tổng hợp lời khuyên chuẩn bị
        List<String> preparationAdvice = marketPlaceWeatherService.getExtremeWeatherAdvice(extremeWeather);
        
        Map<String, Object> result = new HashMap<>();
        result.put("extremeWeatherForecast", extremeWeather);
        result.put("preparationProducts", preparationProducts);
        result.put("preparationAdvice", preparationAdvice);
        
        return ResponseEntity.ok(new ApiResponse<>(true, 
                "Đã cập nhật dữ liệu", result));
    }

    @GetMapping("/weather-product-performance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWeatherProductPerformance(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "6") int period) {
        
        String logMessage = "Lấy báo cáo hiệu suất sản phẩm theo thời tiết";
        if (productId != null) {
            logMessage += " - sản phẩm ID: " + productId;
        }
        if (region != null) {
            logMessage += " - khu vực: " + region;
        }
        logMessage += " - khoảng thời gian: " + period + " tháng";
        
        log.info(logMessage);
        
        // Phân tích hiệu suất của sản phẩm dựa trên dữ liệu thời tiết
        Map<String, Object> performanceData = 
                marketPlaceWeatherService.analyzeProductPerformanceByWeather(productId, region, period);
        
        // Lấy các khuyến nghị tối ưu việc sử dụng sản phẩm
        List<String> optimizationTips = 
                marketPlaceWeatherService.getProductOptimizationTips(productId, performanceData);
        
        // Dự đoán hiệu suất trong tương lai dựa trên dự báo thời tiết
        Map<String, Object> futurePredictions = 
                marketPlaceWeatherService.predictFutureProductPerformance(productId, region);
        
        Map<String, Object> result = new HashMap<>();
        result.put("performanceData", performanceData);
        result.put("optimizationTips", optimizationTips);
        result.put("futurePredictions", futurePredictions);
        
        return ResponseEntity.ok(new ApiResponse<>(true, 
                "Lấy báo cáo hiệu suất sản phẩm theo thời tiết thành công", result));
    }
} 