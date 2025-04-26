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

    /**
     * Lấy sản phẩm phù hợp với điều kiện thời tiết hiện tại ở một địa điểm
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @param page Số trang (bắt đầu từ 0)
     * @param size Kích thước trang
     * @return Danh sách sản phẩm phù hợp với thời tiết
     */
    @GetMapping("/by-weather")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductsByWeather(
            @RequestParam String city,
            @RequestParam String country,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm theo thời tiết - thành phố: {}, quốc gia: {}", city, country);
        
        // Lấy thông tin thời tiết hiện tại
        WeatherDataDTO weatherData = weatherService.getCurrentWeather(city, country);
        
        // Lấy sản phẩm theo mùa vụ
        Pageable pageable = PageRequest.of(page, size);
        Page<MarketPlaceDTO> seasonalProducts = recommendationService.getSeasonalProducts(pageable);
        
        Map<String, Object> result = new HashMap<>();
        result.put("weatherData", weatherData);
        result.put("seasonalProducts", seasonalProducts);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm theo thời tiết thành công", result));
    }

    /**
     * Lấy sản phẩm phù hợp để mua trong thời tiết mưa
     * 
     * @param page Số trang (bắt đầu từ 0)
     * @param size Kích thước trang
     * @return Danh sách sản phẩm phù hợp khi trời mưa
     */
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

    /**
     * Lấy sản phẩm phù hợp để mua trong thời tiết nắng/khô
     * 
     * @param page Số trang (bắt đầu từ 0)
     * @param size Kích thước trang
     * @return Danh sách sản phẩm phù hợp khi trời nắng
     */
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

    /**
     * Lấy sản phẩm sắp vào mùa vụ để chuẩn bị trước
     * 
     * @param page Số trang (bắt đầu từ 0)
     * @param size Kích thước trang
     * @return Danh sách sản phẩm sắp vào mùa vụ
     */
    @GetMapping("/upcoming-season")
    public ResponseEntity<ApiResponse<Page<MarketPlaceDTO>>> getUpcomingSeasonProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm sắp vào mùa vụ - trang: {}, kích thước: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MarketPlaceDTO> products = recommendationService.getUpcomingSeasonalProducts(pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm sắp vào mùa vụ thành công", products));
    }

    /**
     * Lấy thông tin tổng hợp để hiển thị trên trang chủ
     * Kết hợp thông tin thời tiết và các sản phẩm gợi ý
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Thông tin tổng hợp
     */
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
    
    /**
     * Tạo thông điệp marketing dựa vào điều kiện thời tiết
     * 
     * @param weatherData Dữ liệu thời tiết
     * @return Thông điệp marketing
     */
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

    /**
     * Lấy danh sách chi tiết các gợi ý sản phẩm dựa trên thời tiết và mùa vụ
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Danh sách các gợi ý chi tiết
     */
    @GetMapping("/detailed-recommendations")
    public ResponseEntity<ApiResponse<List<SeasonalRecommendationDTO>>> getDetailedRecommendations(
            @RequestParam String city,
            @RequestParam String country) {
        
        log.info("Lấy danh sách gợi ý chi tiết - thành phố: {}, quốc gia: {}", city, country);
        
        List<SeasonalRecommendationDTO> recommendations = marketPlaceWeatherService.getDetailedRecommendations(city, country);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gợi ý chi tiết thành công", recommendations));
    }
    
    /**
     * Lấy danh sách các gợi ý khuyến mãi theo mùa vụ
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Thông tin khuyến mãi theo mùa vụ
     */
    @GetMapping("/seasonal-promotions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSeasonalPromotions(
            @RequestParam String city,
            @RequestParam String country) {
        
        log.info("Lấy khuyến mãi theo mùa vụ - thành phố: {}, quốc gia: {}", city, country);
        
        Map<String, Object> promotions = marketPlaceWeatherService.getSeasonalPromotions(city, country);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin khuyến mãi theo mùa vụ thành công", promotions));
    }
} 