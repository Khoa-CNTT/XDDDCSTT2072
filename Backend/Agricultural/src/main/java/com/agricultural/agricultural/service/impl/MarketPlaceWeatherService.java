package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;
import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductCategory;
import com.agricultural.agricultural.mapper.MarketPlaceMapper;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductCategoryRepository;
import com.agricultural.agricultural.service.IMarketPlaceWeatherService;
import com.agricultural.agricultural.service.IWeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

import com.agricultural.agricultural.dto.SeasonalRecommendationDTO;
import com.agricultural.agricultural.dto.SeasonalRecommendationDTO.RecommendationType;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPlaceWeatherService implements IMarketPlaceWeatherService {

    private final IMarketPlaceRepository marketPlaceRepository;
    private final IWeatherService weatherService;
    private final MarketPlaceMapper marketPlaceMapper;
    private final IProductCategoryRepository productCategoryRepository;

    @Override
    public List<MarketPlaceDTO> getProductsForCurrentWeather(String city, String country) {
        WeatherDataDTO weatherData = weatherService.getCurrentWeather(city, country);
        List<MarketPlaceDTO> products = getProductsByWeatherCondition(weatherData);
        
        // Đảm bảo không trả về danh sách rỗng
        if (products.isEmpty()) {
            log.warn("Không tìm thấy sản phẩm phù hợp với thời tiết hiện tại, trả về tất cả sản phẩm");
            List<MarketPlace> allProducts = marketPlaceRepository.findAll();
            if (!allProducts.isEmpty()) {
                products = allProducts.stream()
                    .limit(10) // Giới hạn số lượng sản phẩm trả về
                    .map(marketPlaceMapper::toDTO)
                    .collect(Collectors.toList());
            }
        }
        
        return products;
    }

    @Override
    public Page<MarketPlaceDTO> getProductsForRainySeason(Pageable pageable) {
        // Các loại nông sản phù hợp cho mùa mưa
        Set<String> rainySeasonCategories = Set.of(
            "Rau củ", 
            "Hạt giống", 
            "Phân bón"
        );
        
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        // Lấy danh mục từ repository
        List<ProductCategory> categories = productCategoryRepository.findByNameIn(rainySeasonCategories);
        Set<Integer> categoryIds = categories.stream()
            .map(ProductCategory::getId)
            .collect(Collectors.toSet());
        
        // Lọc sản phẩm theo danh mục phù hợp cho mùa mưa
        List<MarketPlace> filteredProducts = allProducts.stream()
            .filter(product -> product.getCategory() != null && 
                   categoryIds.contains(product.getCategory().getId()))
            .collect(Collectors.toList());
        
        return paginateProducts(filteredProducts, pageable);
    }

    @Override
    public Page<MarketPlaceDTO> getProductsForDrySeason(Pageable pageable) {
        // Các loại nông sản phù hợp cho mùa khô
        Set<String> drySeasonCategories = Set.of(
            "Trái cây", 
            "Hoa", 
            "Thiết bị"
        );
        
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        // Lấy danh mục từ repository
        List<ProductCategory> categories = productCategoryRepository.findByNameIn(drySeasonCategories);
        Set<Integer> categoryIds = categories.stream()
            .map(ProductCategory::getId)
            .collect(Collectors.toSet());
        
        // Lọc sản phẩm theo danh mục phù hợp cho mùa khô
        List<MarketPlace> filteredProducts = allProducts.stream()
            .filter(product -> product.getCategory() != null && 
                   categoryIds.contains(product.getCategory().getId()))
            .collect(Collectors.toList());
        
        return paginateProducts(filteredProducts, pageable);
    }

    @Override
    public List<MarketPlaceDTO> getProductsForPlanting(String city, String country) {
        Optional<AgriculturalAdviceDTO> advice = weatherService.getLatestAgriculturalAdvice(city, country);
        
        if (advice.isPresent() && Boolean.TRUE.equals(advice.get().getIsSuitableForPlanting())) {
            // Danh sách các sản phẩm phù hợp cho việc trồng trọt
            Set<String> plantingCategories = Set.of(
                "Hạt giống", 
                "Phân bón", 
                "Cây giống"
            );
            
            // Lấy danh mục từ repository
            List<ProductCategory> categories = productCategoryRepository.findByNameIn(plantingCategories);
            Set<Integer> categoryIds = categories.stream()
                .map(ProductCategory::getId)
                .collect(Collectors.toSet());
            
            List<MarketPlace> allProducts = marketPlaceRepository.findAll();
            
            return allProducts.stream()
                .filter(product -> product.getCategory() != null && 
                       categoryIds.contains(product.getCategory().getId()))
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        }
        
        return Collections.emptyList();
    }

    @Override
    public List<MarketPlaceDTO> getProductsForHarvesting(String city, String country) {
        Optional<AgriculturalAdviceDTO> advice = weatherService.getLatestAgriculturalAdvice(city, country);
        
        if (advice.isPresent() && Boolean.TRUE.equals(advice.get().getIsSuitableForHarvesting())) {
            // Danh sách các sản phẩm phù hợp cho việc thu hoạch
            Set<String> harvestingCategories = Set.of(
                "Thiết bị", 
                "Bảo quản"
            );
            
            // Lấy danh mục từ repository
            List<ProductCategory> categories = productCategoryRepository.findByNameIn(harvestingCategories);
            Set<Integer> categoryIds = categories.stream()
                .map(ProductCategory::getId)
                .collect(Collectors.toSet());
            
            List<MarketPlace> allProducts = marketPlaceRepository.findAll();
            
            return allProducts.stream()
                .filter(product -> product.getCategory() != null && 
                       categoryIds.contains(product.getCategory().getId()))
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        }
        
        return Collections.emptyList();
    }
    
    @Override
    public Map<String, Object> getSeasonalPromotions(String city, String country) {
        WeatherDataDTO weatherData = weatherService.getCurrentWeather(city, country);
        
        // Xác định mùa hiện tại dựa trên tháng
        Month currentMonth = LocalDateTime.now().getMonth();
        String season = determineSeason(currentMonth);
        
        // Xác định điều kiện thời tiết
        String weatherCondition = determineWeatherCondition(weatherData);
        
        // Lấy sản phẩm theo mùa và thời tiết
        List<MarketPlaceDTO> seasonalProducts = getProductsByWeatherCondition(weatherData);
        
        // Tạo thông điệp khuyến mãi
        String promotionMessage = generatePromotionMessage(season, weatherCondition);
        
        // Thêm giảm giá cho sản phẩm theo mùa (mô phỏng)
        List<MarketPlaceDTO> discountedProducts = applySeasonalDiscounts(seasonalProducts, season);
        
        Map<String, Object> result = new HashMap<>();
        result.put("season", season);
        result.put("weatherCondition", weatherCondition);
        result.put("promotionMessage", promotionMessage);
        result.put("seasonalProducts", discountedProducts);
        
        return result;
    }

    @Override
    public List<SeasonalRecommendationDTO> getDetailedRecommendations(String city, String country) {
        WeatherDataDTO weatherData = weatherService.getCurrentWeather(city, country);
        
        // Xác định mùa và điều kiện thời tiết
        Month currentMonth = LocalDateTime.now().getMonth();
        String season = determineSeason(currentMonth);
        String weatherCondition = determineWeatherCondition(weatherData);
        
        List<SeasonalRecommendationDTO> recommendations = new ArrayList<>();
        
        // Thêm các gợi ý theo mùa vụ
        addSeasonalRecommendations(recommendations, season, weatherCondition);
        
        // Thêm gợi ý theo thời tiết hiện tại
        addWeatherRecommendations(recommendations, weatherData);
        
        // Thêm gợi ý đặc biệt dựa vào kết hợp thời tiết và mùa vụ
        addSpecialRecommendations(recommendations, season, weatherCondition, weatherData);
        
        // Thêm gợi ý khuyến mãi
        addPromotionRecommendations(recommendations, season, weatherCondition);
        
        // Sắp xếp theo độ ưu tiên
        recommendations.sort(Comparator.comparingInt(SeasonalRecommendationDTO::getPriority));
        
        return recommendations;
    }
    
    /**
     * Thêm các gợi ý dựa vào mùa vụ
     */
    private void addSeasonalRecommendations(List<SeasonalRecommendationDTO> recommendations, String season, String weatherCondition) {
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        switch (season) {
            case "Xuân":
                // Gợi ý 1: Trồng rau vụ xuân
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Rau vụ xuân - Thời điểm lý tưởng để trồng")
                    .description("Mùa xuân là thời điểm lý tưởng để trồng các loại rau ăn lá và cây ưa mát.")
                    .reason("Nhiệt độ và ánh sáng mùa xuân tạo điều kiện thuận lợi cho cây phát triển")
                    .products(filterProductsByCategories(allProducts, "Hạt giống", "Cây giống")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(1)
                    .icon("spring_leaf")
                    .colorTag("#7CFC00")
                    .build());
                
                // Gợi ý 2: Phân bón vụ xuân
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Phân bón cho vụ xuân")
                    .description("Bổ sung dinh dưỡng cho đất trước khi bắt đầu mùa trồng trọt.")
                    .reason("Đất cần được cải tạo sau mùa đông để chuẩn bị cho vụ xuân")
                    .products(filterProductsByCategories(allProducts, "Phân bón")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(2)
                    .icon("fertilizer")
                    .colorTag("#8FBC8F")
                    .build());
                break;
                
            case "Hè":
                // Gợi ý 1: Trồng cây chịu nhiệt
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Cây trồng chịu nhiệt mùa hè")
                    .description("Các loại cây trồng chịu nhiệt tốt, phù hợp với điều kiện nóng ẩm của mùa hè.")
                    .reason("Nhiệt độ cao của mùa hè đòi hỏi các loại cây trồng có khả năng chịu nhiệt tốt")
                    .products(filterProductsByCategories(allProducts, "Hạt giống", "Trái cây")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(1)
                    .icon("summer_sun")
                    .colorTag("#FF4500")
                    .build());
                
                // Gợi ý 2: Thiết bị tưới tiêu
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Hệ thống tưới tiêu tự động")
                    .description("Tiết kiệm thời gian và công sức với hệ thống tưới tiêu tự động trong mùa nóng.")
                    .reason("Mùa hè nắng nóng, cây trồng cần được tưới nước thường xuyên và đều đặn")
                    .products(filterProductsByCategories(allProducts, "Thiết bị")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(2)
                    .icon("sprinkler")
                    .colorTag("#00BFFF")
                    .build());
                break;
                
            case "Thu":
                // Gợi ý 1: Thu hoạch mùa thu
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Dụng cụ thu hoạch mùa vụ")
                    .description("Chuẩn bị các dụng cụ cần thiết cho mùa thu hoạch sắp tới.")
                    .reason("Mùa thu là thời điểm thu hoạch của nhiều loại cây trồng")
                    .products(filterProductsByCategories(allProducts, "Thiết bị")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(1)
                    .icon("harvest")
                    .colorTag("#DAA520")
                    .build());
                
                // Gợi ý 2: Trồng cây vụ đông xuân
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Chuẩn bị cho vụ đông xuân")
                    .description("Bắt đầu chuẩn bị gieo trồng các loại cây vụ đông xuân.")
                    .reason("Thời điểm cuối thu là lúc thích hợp để chuẩn bị cho vụ đông xuân")
                    .products(filterProductsByCategories(allProducts, "Hạt giống", "Cây giống")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(2)
                    .icon("seeds")
                    .colorTag("#A0522D")
                    .build());
                break;
                
            case "Đông":
                // Gợi ý 1: Bảo vệ cây trồng mùa đông
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Bảo vệ cây trồng trong mùa lạnh")
                    .description("Các sản phẩm giúp bảo vệ cây trồng khỏi điều kiện thời tiết lạnh giá.")
                    .reason("Nhiệt độ thấp có thể ảnh hưởng tiêu cực đến sự phát triển của cây trồng")
                    .products(filterProductsByCategories(allProducts, "Thiết bị", "Bảo quản")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(1)
                    .icon("winter_protect")
                    .colorTag("#4682B4")
                    .build());
                
                // Gợi ý 2: Trồng trong nhà kính
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Canh tác trong nhà kính")
                    .description("Giải pháp canh tác trong nhà kính cho mùa đông lạnh giá.")
                    .reason("Nhà kính giúp duy trì nhiệt độ ổn định cho cây trồng trong mùa lạnh")
                    .products(filterProductsByCategories(allProducts, "Thiết bị", "Hạt giống")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.SEASONAL)
                    .priority(2)
                    .icon("greenhouse")
                    .colorTag("#5F9EA0")
                    .build());
                break;
        }
    }
    
    /**
     * Thêm các gợi ý dựa vào điều kiện thời tiết hiện tại
     */
    private void addWeatherRecommendations(List<SeasonalRecommendationDTO> recommendations, WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        double windSpeed = weatherData.getWindSpeed(); // Thêm xét điều kiện gió
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        // Gợi ý cho thời tiết mưa
        if (description.contains("mưa") || description.contains("rain")) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Đối phó với thời tiết mưa")
                .description("Các sản phẩm giúp bảo vệ vườn tược trong điều kiện mưa nhiều.")
                .reason("Thời tiết đang mưa, cần các giải pháp thoát nước và bảo vệ cây trồng")
                .products(filterProductsByCategories(allProducts, "Thiết bị", "Bảo quản")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(1)
                .icon("rain")
                .colorTag("#1E90FF")
                .build());
                
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Hạt giống rau mùa mưa")
                .description("Các loại rau phù hợp gieo trồng trong điều kiện mưa nhiều.")
                .reason("Thời tiết mưa thuận lợi cho một số loại rau ưa nước phát triển")
                .products(filterProductsByCategories(allProducts, "Hạt giống", "Rau củ")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(2)
                .icon("vegetable_seeds")
                .colorTag("#32CD32")
                .build());
            
            // Thêm gợi ý phân bón cho mùa mưa
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Phân bón dành cho mùa mưa")
                .description("Phân bón với khả năng chống rửa trôi, phù hợp cho thời tiết mưa nhiều.")
                .reason("Mưa nhiều có thể làm rửa trôi dinh dưỡng, cần bổ sung phân bón đặc biệt")
                .products(filterProductsByCategories(allProducts, "Phân bón")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(3)
                .icon("fertilizer")
                .colorTag("#8B4513")
                .build());
        }
        
        // Gợi ý cho thời tiết nắng nóng
        if (temperature > 30) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Đối phó với nắng nóng")
                .description("Các giải pháp tưới tiêu và che phủ cho cây trồng trong thời tiết nắng nóng.")
                .reason("Nhiệt độ cao ("+temperature+"°C) có thể gây stress cho cây trồng")
                .products(filterProductsByCategories(allProducts, "Thiết bị")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(1)
                .icon("hot_sun")
                .colorTag("#FF8C00")
                .build());
                
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Cây trồng chịu hạn")
                .description("Các loại cây trồng có khả năng chịu hạn tốt trong điều kiện nắng nóng.")
                .reason("Nhiệt độ cao và khô hạn đòi hỏi các giống cây có khả năng chịu hạn")
                .products(filterProductsByCategories(allProducts, "Trái cây", "Hạt giống")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(3)
                .icon("drought_plant")
                .colorTag("#CD853F")
                .build());
            
            // Thêm gợi ý về chất giữ ẩm và điều hòa nước
            if (humidity < 50) {
                recommendations.add(SeasonalRecommendationDTO.builder()
                    .title("Chất giữ ẩm và điều hòa nước")
                    .description("Các sản phẩm giúp giữ ẩm đất và tiết kiệm nước tưới trong điều kiện nắng nóng khô hanh.")
                    .reason("Nhiệt độ cao ("+temperature+"°C) kết hợp với độ ẩm thấp ("+humidity+"%) cần biện pháp giữ ẩm đặc biệt")
                    .products(filterProductsByCategories(allProducts, "Phân bón", "Vật tư")
                        .stream().limit(5).collect(Collectors.toList()))
                    .type(RecommendationType.WEATHER)
                    .priority(2)
                    .icon("moisture_control")
                    .colorTag("#4682B4")
                    .build());
            }
        }
        
        // Gợi ý cho độ ẩm thấp
        if (humidity < 40) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Duy trì độ ẩm cho cây trồng")
                .description("Các sản phẩm giúp duy trì độ ẩm cho cây trồng trong điều kiện khô hanh.")
                .reason("Độ ẩm thấp ("+humidity+"%) có thể ảnh hưởng đến sự phát triển của cây")
                .products(filterProductsByCategories(allProducts, "Thiết bị")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(2)
                .icon("humidity")
                .colorTag("#87CEEB")
                .build());
        }
        
        // Gợi ý cho thời tiết mát mẻ, lý tưởng
        if (temperature >= 18 && temperature <= 28 && humidity >= 40 && humidity <= 70) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Thời điểm lý tưởng để gieo trồng")
                .description("Tận dụng điều kiện thời tiết lý tưởng hiện tại để bắt đầu gieo trồng.")
                .reason("Nhiệt độ và độ ẩm hiện tại rất thuận lợi cho việc gieo trồng hầu hết các loại cây")
                .products(filterProductsByCategories(allProducts, "Hạt giống", "Cây giống")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(1)
                .icon("perfect_weather")
                .colorTag("#00CED1")
                .build());
            
            // Thêm gợi ý phân bón đa năng cho thời tiết lý tưởng
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Phân bón tổng hợp cho mùa vụ mới")
                .description("Phân bón đầy đủ dưỡng chất cho giai đoạn phát triển mạnh của cây trồng.")
                .reason("Thời tiết thuận lợi, cây hấp thụ dinh dưỡng hiệu quả nhất")
                .products(filterProductsByCategories(allProducts, "Phân bón")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(2)
                .icon("fertilizer")
                .colorTag("#228B22")
                .build());
        }
        
        // Gợi ý cho thời tiết gió mạnh
        if (windSpeed > 8.0) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Bảo vệ cây trồng khỏi gió mạnh")
                .description("Các sản phẩm giúp bảo vệ cây trồng khỏi tác động của gió mạnh.")
                .reason("Gió mạnh ("+windSpeed+" m/s) có thể làm gãy cành, đổ cây")
                .products(filterProductsByCategories(allProducts, "Vật tư", "Thiết bị")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(1)
                .icon("wind")
                .colorTag("#708090")
                .build());
        }
        
        // Gợi ý cho thời tiết lạnh
        if (temperature < 15) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Bảo vệ cây trồng khỏi giá lạnh")
                .description("Các sản phẩm giúp giữ ấm và bảo vệ cây trồng trong thời tiết lạnh.")
                .reason("Nhiệt độ thấp ("+temperature+"°C) có thể ảnh hưởng đến sự sinh trưởng của cây")
                .products(filterProductsByCategories(allProducts, "Vật tư", "Bảo quản")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(1)
                .icon("cold")
                .colorTag("#4169E1")
                .build());
            
            // Thêm gợi ý hạt giống chịu lạnh
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Hạt giống cây chịu lạnh")
                .description("Các loại hạt giống phù hợp gieo trồng trong điều kiện thời tiết lạnh.")
                .reason("Thời tiết lạnh phù hợp cho một số loại rau và cây ưa mát")
                .products(filterProductsByCategories(allProducts, "Hạt giống", "Rau củ")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.WEATHER)
                .priority(2)
                .icon("cold_vegetable")
                .colorTag("#6B8E23")
                .build());
        }
    }
    
    /**
     * Thêm các gợi ý đặc biệt dựa trên kết hợp mùa vụ và thời tiết
     */
    private void addSpecialRecommendations(List<SeasonalRecommendationDTO> recommendations, 
                                          String season, String weatherCondition, WeatherDataDTO weatherData) {
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        // Điều kiện đặc biệt: Mùa hè + nắng nóng
        if ("Hè".equals(season) && "Nóng".equals(weatherCondition)) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Bộ sản phẩm đặc biệt cho mùa hè nắng nóng")
                .description("Combo sản phẩm giúp cây trồng vượt qua thời tiết khắc nghiệt của mùa hè.")
                .reason("Nhiệt độ cao kéo dài trong mùa hè đòi hỏi biện pháp bảo vệ đặc biệt cho cây trồng")
                .products(filterProductsByCategories(allProducts, "Thiết bị", "Phân bón")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.SPECIAL_EVENT)
                .priority(1)
                .icon("hot_summer")
                .colorTag("#FF4500")
                .build());
        }
        
        // Điều kiện đặc biệt: Mùa đông + lạnh
        if ("Đông".equals(season) && "Lạnh".equals(weatherCondition)) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Combo bảo vệ cây trong mùa đông giá lạnh")
                .description("Bộ sản phẩm chống rét và bảo vệ cây khỏi sương giá mùa đông.")
                .reason("Nhiệt độ thấp kéo dài có thể gây hại cho nhiều loại cây trồng")
                .products(filterProductsByCategories(allProducts, "Thiết bị", "Bảo quản")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.SPECIAL_EVENT)
                .priority(1)
                .icon("cold_winter")
                .colorTag("#4169E1")
                .build());
        }
        
        // Điều kiện đặc biệt: Mùa thu + mưa
        if ("Thu".equals(season) && "Mưa".equals(weatherCondition)) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Sản phẩm cho mùa thu mưa")
                .description("Giải pháp thoát nước và bảo vệ cây trong mùa thu mưa nhiều.")
                .reason("Mưa nhiều trong mùa thu có thể gây ngập úng và ảnh hưởng đến vụ thu hoạch")
                .products(filterProductsByCategories(allProducts, "Thiết bị", "Bảo quản")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.SPECIAL_EVENT)
                .priority(2)
                .icon("autumn_rain")
                .colorTag("#DAA520")
                .build());
        }
        
        // Điều kiện đặc biệt: Xuân + nắng ấm
        if ("Xuân".equals(season) && "Nắng".equals(weatherCondition)) {
            recommendations.add(SeasonalRecommendationDTO.builder()
                .title("Bắt đầu mùa trồng trọt với thời tiết xuân ấm")
                .description("Combo sản phẩm khởi đầu hoàn hảo cho mùa trồng trọt mới.")
                .reason("Thời tiết xuân ấm là điều kiện lý tưởng để bắt đầu gieo trồng nhiều loại cây")
                .products(filterProductsByCategories(allProducts, "Hạt giống", "Phân bón")
                    .stream().limit(5).collect(Collectors.toList()))
                .type(RecommendationType.SPECIAL_EVENT)
                .priority(1)
                .icon("spring_sun")
                .colorTag("#7FFF00")
                .build());
        }
    }
    
    /**
     * Thêm các gợi ý khuyến mãi theo mùa vụ
     */
    private void addPromotionRecommendations(List<SeasonalRecommendationDTO> recommendations, String season, String weatherCondition) {
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        String promotionTitle = "Khuyến mãi đặc biệt mùa " + season;
        String promotionDescription = "Giảm giá đặc biệt cho mùa " + season + ".";
        String promotionReason = "Ưu đãi theo mùa " + season;
        int discountPercent = 10; // Mặc định
        
        switch (season) {
            case "Xuân":
                discountPercent = 15;
                promotionDescription = "Chào mừng mùa xuân tươi mới! Giảm giá 15% cho các sản phẩm hạt giống và cây con.";
                break;
            case "Hè":
                if ("Nóng".equals(weatherCondition)) {
                    discountPercent = 20;
                    promotionDescription = "Mùa hè nắng nóng! Giảm giá 20% cho các sản phẩm tưới tiêu và bảo vệ cây trồng.";
                } else {
                    discountPercent = 10;
                    promotionDescription = "Mùa hè năng động! Giảm giá 10% cho tất cả các sản phẩm nông nghiệp.";
                }
                break;
            case "Thu":
                discountPercent = 15;
                promotionDescription = "Mùa thu gặt hái! Giảm giá 15% cho các sản phẩm thu hoạch và bảo quản.";
                break;
            case "Đông":
                if ("Lạnh".equals(weatherCondition)) {
                    discountPercent = 25;
                    promotionDescription = "Mùa đông giá lạnh! Giảm giá 25% cho các sản phẩm bảo vệ cây trồng khỏi thời tiết khắc nghiệt.";
                } else {
                    discountPercent = 10;
                    promotionDescription = "Mùa đông ấm áp! Giảm giá 10% cho các sản phẩm trồng trọt trong nhà.";
                }
                break;
        }
        
        // Áp dụng giảm giá cho sản phẩm
        final int finalDiscountPercent = discountPercent;
        List<MarketPlaceDTO> discountedProducts = allProducts.stream()
            .limit(5)
            .map(marketPlaceMapper::toDTO)
            .map(product -> {
                if (product.getPrice() != null) {
                    BigDecimal discount = product.getPrice().multiply(BigDecimal.valueOf(finalDiscountPercent / 100.0));
                    BigDecimal discountedPrice = product.getPrice().subtract(discount);
                    product.setDiscountedPrice(discountedPrice);
                    product.setDiscountRate(BigDecimal.valueOf(finalDiscountPercent));
                }
                return product;
            })
            .collect(Collectors.toList());
        
        String colorTag;
        switch (season) {
            case "Xuân": colorTag = "#98FB98"; break;
            case "Hè": colorTag = "#FF6347"; break;
            case "Thu": colorTag = "#F4A460"; break;
            case "Đông": colorTag = "#B0C4DE"; break;
            default: colorTag = "#20B2AA";
        }
        
        recommendations.add(SeasonalRecommendationDTO.builder()
            .title(promotionTitle)
            .description(promotionDescription)
            .reason(promotionReason)
            .products(discountedProducts)
            .type(RecommendationType.PROMOTION)
            .priority(1)
            .icon("discount_" + season.toLowerCase())
            .colorTag(colorTag)
            .build());
    }

    // Phương thức phụ trợ
    
    private List<MarketPlaceDTO> getProductsByWeatherCondition(WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        log.info("Tổng số sản phẩm trong database: {}", allProducts.size());
        
        // Nếu không có sản phẩm nào, trả về danh sách rỗng
        if (allProducts.isEmpty()) {
            log.warn("Không có sản phẩm nào trong database");
            return Collections.emptyList();
        }
        
        List<MarketPlaceDTO> filteredProducts;
        
        // Lọc sản phẩm theo điều kiện thời tiết
        if (description.contains("mưa") || description.contains("rain")) {
            // Sản phẩm phù hợp với thời tiết mưa
            log.info("Thời tiết mưa: Lọc sản phẩm phù hợp");
            filteredProducts = filterProductsByCategories(allProducts, 
                "Rau củ", "Hạt giống", "Phân bón");
        } else if (temperature > 30) {
            // Sản phẩm phù hợp với thời tiết nóng
            log.info("Thời tiết nóng ({}°C): Lọc sản phẩm phù hợp", temperature);
            filteredProducts = filterProductsByCategories(allProducts,
                "Trái cây", "Thiết bị");
        } else if (humidity < 40) {
            // Sản phẩm phù hợp với độ ẩm thấp
            log.info("Độ ẩm thấp ({}%): Lọc sản phẩm phù hợp", humidity);
            filteredProducts = filterProductsByCategories(allProducts,
                "Thiết bị", "Bảo quản");
        } else {
            // Thời tiết bình thường
            log.info("Thời tiết bình thường: Lọc sản phẩm phù hợp");
            filteredProducts = filterProductsByCategories(allProducts,
                "Rau củ", "Trái cây", "Hoa");
        }
        
        // Nếu không tìm thấy sản phẩm phù hợp, trả về tất cả sản phẩm
        if (filteredProducts.isEmpty()) {
            log.warn("Không tìm thấy sản phẩm phù hợp với điều kiện thời tiết. Trả về tất cả sản phẩm.");
            return allProducts.stream()
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        }
        
        log.info("Số sản phẩm phù hợp tìm được: {}", filteredProducts.size());
        return filteredProducts;
    }
    
    private List<MarketPlaceDTO> filterProductsByCategories(List<MarketPlace> products, String... categoryNames) {
        if (categoryNames == null || categoryNames.length == 0) {
            log.warn("Không có danh mục nào được chỉ định, trả về tất cả sản phẩm");
            return products.stream()
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        }
        
        Set<String> categoryNameSet = new HashSet<>(Arrays.asList(categoryNames));
        log.info("Lọc sản phẩm theo các danh mục: {}", categoryNameSet);
        
        // Lấy các danh mục từ repository
        List<ProductCategory> categories = productCategoryRepository.findByNameIn(categoryNameSet);
        
        if (categories.isEmpty()) {
            log.warn("Không tìm thấy danh mục nào phù hợp trong database, trả về tất cả sản phẩm");
            return products.stream()
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        }
        
        Set<Integer> categoryIds = categories.stream()
            .map(ProductCategory::getId)
            .collect(Collectors.toSet());
        
        log.info("Tìm thấy {} danh mục phù hợp với ID: {}", categories.size(), categoryIds);
        
        List<MarketPlaceDTO> filteredProducts = products.stream()
            .filter(product -> product.getCategory() != null && 
                   categoryIds.contains(product.getCategory().getId()))
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
            
        log.info("Lọc được {} sản phẩm phù hợp với các danh mục", filteredProducts.size());
        
        // Nếu không tìm thấy sản phẩm phù hợp, trả về tất cả sản phẩm
        if (filteredProducts.isEmpty()) {
            log.warn("Không tìm thấy sản phẩm nào phù hợp với các danh mục, trả về tất cả sản phẩm");
            return products.stream()
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        }
        
        return filteredProducts;
    }
    
    private String determineSeason(Month month) {
        switch (month) {
            case DECEMBER:
            case JANUARY:
            case FEBRUARY:
                return "Đông";
            case MARCH:
            case APRIL:
            case MAY:
                return "Xuân";
            case JUNE:
            case JULY:
            case AUGUST:
                return "Hè";
            case SEPTEMBER:
            case OCTOBER:
            case NOVEMBER:
                return "Thu";
            default:
                return "Khác";
        }
    }
    
    private String determineWeatherCondition(WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        
        if (description.contains("mưa") || description.contains("rain")) {
            return "Mưa";
        } else if (temperature > 30) {
            return "Nóng";
        } else if (temperature < 15) {
            return "Lạnh";
        } else if (description.contains("nắng") || description.contains("sun") || description.contains("clear")) {
            return "Nắng";
        } else {
            return "Bình thường";
        }
    }
    
    private String generatePromotionMessage(String season, String weatherCondition) {
        switch (season) {
            case "Xuân":
                return "Chào mừng mùa xuân tươi mới! Giảm giá 15% cho các sản phẩm hạt giống và cây con.";
            case "Hè":
                if ("Nóng".equals(weatherCondition)) {
                    return "Mùa hè nắng nóng! Giảm giá 20% cho các sản phẩm tưới tiêu và bảo vệ cây trồng.";
                } else {
                    return "Mùa hè năng động! Giảm giá 10% cho tất cả các sản phẩm nông nghiệp.";
                }
            case "Thu":
                return "Mùa thu gặt hái! Giảm giá 15% cho các sản phẩm thu hoạch và bảo quản.";
            case "Đông":
                if ("Lạnh".equals(weatherCondition)) {
                    return "Mùa đông giá lạnh! Giảm giá 25% cho các sản phẩm bảo vệ cây trồng khỏi thời tiết khắc nghiệt.";
                } else {
                    return "Mùa đông ấm áp! Giảm giá 10% cho các sản phẩm trồng trọt trong nhà.";
                }
            default:
                return "Khám phá các sản phẩm nông nghiệp với giá ưu đãi!";
        }
    }
    
    private List<MarketPlaceDTO> applySeasonalDiscounts(List<MarketPlaceDTO> products, String season) {
        // Mô phỏng áp dụng giảm giá theo mùa
        double discountRate;
        
        switch (season) {
            case "Xuân":
                discountRate = 0.15; // Giảm 15%
                break;
            case "Hè":
                discountRate = 0.10; // Giảm 10%
                break;
            case "Thu":
                discountRate = 0.15; // Giảm 15%
                break;
            case "Đông":
                discountRate = 0.20; // Giảm 20%
                break;
            default:
                discountRate = 0.05; // Giảm 5%
        }
        
        // Áp dụng giảm giá
        return products.stream().map(product -> {
            // Tính giá sau khi giảm
            BigDecimal originalPrice = product.getPrice();
            if (originalPrice != null) {
                BigDecimal discountAmount = originalPrice.multiply(BigDecimal.valueOf(discountRate));
                BigDecimal discountedPrice = originalPrice.subtract(discountAmount);
                product.setDiscountedPrice(discountedPrice);
                product.setDiscountRate(BigDecimal.valueOf(discountRate * 100));
            }
            return product;
        }).collect(Collectors.toList());
    }
    
    private Page<MarketPlaceDTO> paginateProducts(List<MarketPlace> products, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), products.size());
        
        if (start >= products.size()) {
            return Page.empty(pageable);
        }
        
        List<MarketPlace> pagedProducts = products.subList(start, end);
        
        List<MarketPlaceDTO> result = pagedProducts.stream()
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
            
        return new PageImpl<>(result, pageable, products.size());
    }

    @Override
    public Page<MarketPlaceDTO> getProductsByCropAndWeather(String cropType, WeatherDataDTO weatherData, Pageable pageable) {
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        List<MarketPlace> filteredProducts = new ArrayList<>();
        
        // Phân loại theo loại cây trồng
        switch(cropType.toLowerCase()) {
            case "lúa":
                // Lọc sản phẩm cho cây lúa
                filteredProducts = filterProductsForRice(allProducts, weatherData);
                break;
                
            case "rau":
                // Lọc sản phẩm cho rau
                filteredProducts = filterProductsForVegetables(allProducts, weatherData);
                break;
                
            case "cây ăn quả":
                // Lọc sản phẩm cho cây ăn quả
                filteredProducts = filterProductsForFruitTrees(allProducts, weatherData);
                break;
                
            default:
                // Mặc định, lấy sản phẩm phù hợp với thời tiết hiện tại
                filteredProducts = getProductsByWeatherCondition(weatherData)
                                   .stream()
                                   .map(marketPlaceMapper::toEntity)
                                   .collect(Collectors.toList());
                break;
        }
        
        return paginateProducts(filteredProducts, pageable);
    }
    
    /**
     * Lọc sản phẩm phù hợp cho cây lúa dựa vào thời tiết
     */
    private List<MarketPlace> filterProductsForRice(List<MarketPlace> products, WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        
        // Danh sách các danh mục sản phẩm phù hợp cho cây lúa
        Set<String> riceCategories = new HashSet<>();
        
        // Phân loại theo thời tiết
        if (description.contains("mưa") || description.contains("rain")) {
            // Thời tiết mưa: cần phòng bệnh, thoát nước
            riceCategories.addAll(Set.of("Thuốc BVTV", "Phân bón", "Thiết bị thoát nước"));
        } else if (temperature > 35) {
            // Nhiệt độ cao: cần tưới nước, che nắng
            riceCategories.addAll(Set.of("Thiết bị tưới", "Vật tư che phủ", "Phân bón"));
        } else if (humidity < 40) {
            // Độ ẩm thấp: cần tưới nước, giữ ẩm
            riceCategories.addAll(Set.of("Thiết bị tưới", "Phân bón", "Vật tư giữ ẩm"));
        } else {
            // Điều kiện bình thường
            riceCategories.addAll(Set.of("Hạt giống", "Phân bón", "Thuốc BVTV"));
        }
        
        return filterProductsByCategories(products, riceCategories.toArray(new String[0]))
               .stream()
               .map(marketPlaceMapper::toEntity)
               .collect(Collectors.toList());
    }
    
    /**
     * Lọc sản phẩm phù hợp cho rau dựa vào thời tiết
     */
    private List<MarketPlace> filterProductsForVegetables(List<MarketPlace> products, WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        
        // Danh sách các danh mục sản phẩm phù hợp cho rau
        Set<String> vegetableCategories = new HashSet<>();
        
        // Phân loại theo thời tiết
        if (description.contains("mưa") || description.contains("rain")) {
            // Thời tiết mưa: cần phòng bệnh nấm, thoát nước
            vegetableCategories.addAll(Set.of("Thuốc BVTV", "Vật tư che phủ", "Thiết bị thoát nước"));
        } else if (temperature > 32) {
            // Nhiệt độ cao: cần tưới nước, che nắng
            vegetableCategories.addAll(Set.of("Thiết bị tưới", "Vật tư che phủ", "Hạt giống rau chịu nhiệt"));
        } else {
            // Điều kiện bình thường
            vegetableCategories.addAll(Set.of("Hạt giống", "Phân bón", "Vật tư nhà kính"));
        }
        
        return filterProductsByCategories(products, vegetableCategories.toArray(new String[0]))
               .stream()
               .map(marketPlaceMapper::toEntity)
               .collect(Collectors.toList());
    }
    
    /**
     * Lọc sản phẩm phù hợp cho cây ăn quả dựa vào thời tiết
     */
    private List<MarketPlace> filterProductsForFruitTrees(List<MarketPlace> products, WeatherDataDTO weatherData) {
        String description = weatherData.getWeatherDescription().toLowerCase();
        double temperature = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        
        // Danh sách các danh mục sản phẩm phù hợp cho cây ăn quả
        Set<String> fruitTreeCategories = new HashSet<>();
        
        // Phân loại theo thời tiết
        if (description.contains("mưa") || description.contains("rain")) {
            // Thời tiết mưa: cần phòng bệnh nấm, thoát nước
            fruitTreeCategories.addAll(Set.of("Thuốc BVTV", "Vật tư thoát nước"));
        } else if (temperature > 35) {
            // Nhiệt độ cao: cần tưới nước, che nắng
            fruitTreeCategories.addAll(Set.of("Thiết bị tưới", "Vật tư che phủ", "Phân bón"));
        } else if (humidity < 40) {
            // Độ ẩm thấp: cần tưới nước, giữ ẩm
            fruitTreeCategories.addAll(Set.of("Thiết bị tưới", "Phân bón", "Vật tư giữ ẩm"));
        } else {
            // Điều kiện bình thường
            fruitTreeCategories.addAll(Set.of("Cây giống", "Phân bón", "Thuốc BVTV"));
        }
        
        return filterProductsByCategories(products, fruitTreeCategories.toArray(new String[0]))
               .stream()
               .map(marketPlaceMapper::toEntity)
               .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Object> predictExtremeWeather(String city, String country, int forecastDays) {
        // Lấy dữ liệu dự báo thời tiết
        List<WeatherDataDTO> forecast = weatherService.getWeatherForecast(city, country, forecastDays);
        
        Map<String, Object> extremeWeatherMap = new HashMap<>();
        Map<String, Integer> extremeEventCounter = new HashMap<>();
        
        // Phân tích dự báo thời tiết tìm các hiện tượng khắc nghiệt
        for (WeatherDataDTO data : forecast) {
            String description = data.getWeatherDescription().toLowerCase();
            double temperature = data.getTemperature();
            int humidity = data.getHumidity();
            double windSpeed = data.getWindSpeed();
            
            // Kiểm tra mưa lớn
            if (description.contains("mưa lớn") || description.contains("mưa to") || 
                description.contains("heavy rain") || description.contains("thunderstorm")) {
                extremeEventCounter.put("heavyRain", extremeEventCounter.getOrDefault("heavyRain", 0) + 1);
            }
            
            // Kiểm tra nắng nóng
            if (temperature > 35) {
                extremeEventCounter.put("heatwave", extremeEventCounter.getOrDefault("heatwave", 0) + 1);
            }
            
            // Kiểm tra khô hạn
            if (temperature > 30 && humidity < 40) {
                extremeEventCounter.put("drought", extremeEventCounter.getOrDefault("drought", 0) + 1);
            }
            
            // Kiểm tra gió mạnh
            if (windSpeed > 10) {
                extremeEventCounter.put("strongWind", extremeEventCounter.getOrDefault("strongWind", 0) + 1);
            }
        }
        
        // Xác định các hiện tượng thời tiết khắc nghiệt chính
        for (Map.Entry<String, Integer> entry : extremeEventCounter.entrySet()) {
            if (entry.getValue() >= 2) { // Nếu hiện tượng xảy ra ít nhất 2 ngày
                switch (entry.getKey()) {
                    case "heavyRain":
                        extremeWeatherMap.put("type", "heavyRain");
                        extremeWeatherMap.put("name", "Mưa lớn/Dông bão");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                    case "heatwave":
                        extremeWeatherMap.put("type", "heatwave");
                        extremeWeatherMap.put("name", "Nắng nóng");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                    case "drought":
                        extremeWeatherMap.put("type", "drought");
                        extremeWeatherMap.put("name", "Khô hạn");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                    case "strongWind":
                        extremeWeatherMap.put("type", "strongWind");
                        extremeWeatherMap.put("name", "Gió mạnh");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                }
            }
        }
        
        // Nếu không có hiện tượng thời tiết khắc nghiệt nào
        if (extremeWeatherMap.isEmpty()) {
            extremeWeatherMap.put("type", "normal");
            extremeWeatherMap.put("name", "Thời tiết bình thường");
            extremeWeatherMap.put("severity", "Thấp");
        }
        
        return extremeWeatherMap;
    }
    
    @Override
    public Map<String, List<MarketPlaceDTO>> getProductsForExtremeWeather(Map<String, Object> extremeWeather) {
        Map<String, List<MarketPlaceDTO>> result = new HashMap<>();
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        String weatherType = (String) extremeWeather.getOrDefault("type", "normal");
        
        switch (weatherType) {
            case "heavyRain":
                // Sản phẩm cho mưa lớn/dông bão
                List<MarketPlaceDTO> rainProducts = filterProductsByCategories(allProducts, 
                        "Vật tư thoát nước", "Thiết bị bơm", "Thuốc BVTV", "Vật tư che phủ");
                result.put("chính", rainProducts);
                
                // Sản phẩm phòng bệnh cho cây trồng
                List<MarketPlaceDTO> diseasePreventionProducts = filterProductsByCategories(allProducts, 
                        "Thuốc BVTV", "Phân bón vi sinh");
                result.put("phòng bệnh", diseasePreventionProducts);
                break;
                
            case "heatwave":
                // Sản phẩm cho nắng nóng
                List<MarketPlaceDTO> heatProducts = filterProductsByCategories(allProducts, 
                        "Thiết bị tưới", "Vật tư che phủ", "Vật tư giữ ẩm");
                result.put("chính", heatProducts);
                
                // Sản phẩm tăng sức đề kháng cho cây
                List<MarketPlaceDTO> resistanceProducts = filterProductsByCategories(allProducts, 
                        "Phân bón", "Chất điều hòa sinh trưởng");
                result.put("tăng sức đề kháng", resistanceProducts);
                break;
                
            case "drought":
                // Sản phẩm cho hạn hán
                List<MarketPlaceDTO> droughtProducts = filterProductsByCategories(allProducts, 
                        "Thiết bị tưới", "Vật tư giữ ẩm", "Phân bón");
                result.put("chính", droughtProducts);
                
                // Sản phẩm tiết kiệm nước
                List<MarketPlaceDTO> waterSavingProducts = filterProductsByCategories(allProducts, 
                        "Thiết bị tưới nhỏ giọt", "Vật tư che phủ gốc");
                result.put("tiết kiệm nước", waterSavingProducts);
                break;
                
            case "strongWind":
                // Sản phẩm cho gió mạnh
                List<MarketPlaceDTO> windProducts = filterProductsByCategories(allProducts, 
                        "Vật tư chắn gió", "Dây buộc", "Cọc đỡ");
                result.put("chính", windProducts);
                
                // Sản phẩm gia cố vườn tược
                List<MarketPlaceDTO> reinforcementProducts = filterProductsByCategories(allProducts, 
                        "Vật tư gia cố", "Lưới chắn");
                result.put("gia cố", reinforcementProducts);
                break;
                
            default:
                // Sản phẩm cho thời tiết bình thường
                List<MarketPlaceDTO> normalProducts = filterProductsByCategories(allProducts, 
                        "Hạt giống", "Phân bón", "Thuốc BVTV");
                result.put("chính", normalProducts);
                break;
        }
        
        return result;
    }

    @Override
    public List<String> getExtremeWeatherAdvice(Map<String, Object> extremeWeather) {
        List<String> adviceList = new ArrayList<>();
        String weatherType = (String) extremeWeather.getOrDefault("type", "normal");
        String severity = (String) extremeWeather.getOrDefault("severity", "Thấp");
        
        switch (weatherType) {
            case "heavyRain":
                adviceList.add("Đảm bảo hệ thống thoát nước hoạt động tốt, tránh ngập úng vườn tược");
                adviceList.add("Phun thuốc phòng bệnh nấm cho cây trồng trước khi mưa lớn");
                adviceList.add("Kiểm tra và gia cố mái che, nhà kính để tránh hư hại do mưa lớn");
                if (severity.equals("Cao")) {
                    adviceList.add("Cần thu hoạch sớm những sản phẩm đã gần chín để tránh thiệt hại");
                    adviceList.add("Chuẩn bị máy bơm nước để đối phó với tình trạng ngập úng");
                }
                break;
                
            case "heatwave":
                adviceList.add("Tăng cường tưới nước vào sáng sớm và chiều tối, tránh tưới lúc trời nắng gắt");
                adviceList.add("Bổ sung các loại phân bón giúp cây chống chịu với nhiệt độ cao");
                adviceList.add("Sử dụng lưới che nắng, rơm rạ phủ gốc để giảm nhiệt độ cho cây trồng");
                if (severity.equals("Cao")) {
                    adviceList.add("Sử dụng màng phun sương để tăng độ ẩm cho cây trồng trong những ngày nắng nóng cao điểm");
                    adviceList.add("Nên trồng xen canh để cây cao che bóng cho cây thấp");
                }
                break;
                
            case "drought":
                adviceList.add("Ưu tiên hệ thống tưới tiết kiệm nước như tưới nhỏ giọt");
                adviceList.add("Phủ gốc cây bằng rơm rạ, mùn cưa để giữ ẩm");
                adviceList.add("Bón phân cân đối, tránh bón phân đạm nhiều trong thời kỳ khô hạn");
                if (severity.equals("Cao")) {
                    adviceList.add("Cân nhắc giảm diện tích canh tác để tập trung nguồn nước cho những cây trồng quan trọng");
                    adviceList.add("Thu gom và tái sử dụng nước thải sinh hoạt đã qua xử lý cho việc tưới tiêu");
                }
                break;
                
            case "strongWind":
                adviceList.add("Gia cố giàn trồng, cọc đỡ cho cây cao");
                adviceList.add("Sử dụng lưới chắn gió ở những vị trí trống trải");
                adviceList.add("Tỉa bớt cành lá rậm rạp để giảm sức cản gió");
                if (severity.equals("Cao")) {
                    adviceList.add("Thu hoạch sớm trái cây, rau củ đã gần chín để tránh rụng do gió mạnh");
                    adviceList.add("Che chắn cẩn thận nhà kính, nhà lưới để tránh hư hỏng");
                }
                break;
                
            default:
                adviceList.add("Duy trì lịch chăm sóc cây trồng bình thường");
                adviceList.add("Theo dõi dự báo thời tiết để có kế hoạch chăm sóc phù hợp");
                adviceList.add("Chuẩn bị sẵn các vật tư cần thiết cho những thay đổi thời tiết đột ngột");
                break;
        }
        
        return adviceList;
    }
    
    @Override
    public Map<String, Object> analyzeProductPerformanceByWeather(Integer productId, String region, int period) {
        Map<String, Object> result = new HashMap<>();
        
        // Mô phỏng phân tích hiệu suất sản phẩm
        // Trong thực tế, cần truy vấn dữ liệu lịch sử và thực hiện phân tích
        
        // Tạo dữ liệu mô phỏng về hiệu suất sản phẩm theo điều kiện thời tiết
        Map<String, Map<String, Object>> weatherPerformanceDetailed = new HashMap<>();
        
        // Mưa nhẹ
        Map<String, Object> rainyData = new HashMap<>();
        rainyData.put("averagePerformance", 85.0);
        rainyData.put("salesVolume", 120);
        rainyData.put("averageRating", 4.2);
        rainyData.put("trend", "Tăng");
        weatherPerformanceDetailed.put("Mưa nhẹ", rainyData);
        
        // Nắng nhẹ
        Map<String, Object> sunnyData = new HashMap<>();
        sunnyData.put("averagePerformance", 90.0);
        sunnyData.put("salesVolume", 150);
        sunnyData.put("averageRating", 4.5);
        sunnyData.put("trend", "Ổn định");
        weatherPerformanceDetailed.put("Nắng nhẹ", sunnyData);
        
        // Mưa vừa
        Map<String, Object> moderateRainData = new HashMap<>();
        moderateRainData.put("averagePerformance", 75.0);
        moderateRainData.put("salesVolume", 90);
        moderateRainData.put("averageRating", 3.8);
        moderateRainData.put("trend", "Giảm");
        weatherPerformanceDetailed.put("Mưa vừa", moderateRainData);
        
        // Nắng vừa
        Map<String, Object> moderateSunnyData = new HashMap<>();
        moderateSunnyData.put("averagePerformance", 80.0);
        moderateSunnyData.put("salesVolume", 110);
        moderateSunnyData.put("averageRating", 4.0);
        moderateSunnyData.put("trend", "Ổn định");
        weatherPerformanceDetailed.put("Nắng vừa", moderateSunnyData);
        
        // Mưa to
        Map<String, Object> heavyRainData = new HashMap<>();
        heavyRainData.put("averagePerformance", 60.0);
        heavyRainData.put("salesVolume", 50);
        heavyRainData.put("averageRating", 3.2);
        heavyRainData.put("trend", "Giảm");
        weatherPerformanceDetailed.put("Mưa to", heavyRainData);
        
        // Nắng gắt
        Map<String, Object> intenseSunnyData = new HashMap<>();
        intenseSunnyData.put("averagePerformance", 65.0);
        intenseSunnyData.put("salesVolume", 70);
        intenseSunnyData.put("averageRating", 3.5);
        intenseSunnyData.put("trend", "Giảm");
        weatherPerformanceDetailed.put("Nắng gắt", intenseSunnyData);
        
        // Tạo dữ liệu cơ bản về hiệu suất sản phẩm theo điều kiện thời tiết
        Map<String, Double> weatherPerformance = new HashMap<>();
        weatherPerformance.put("Mưa nhẹ", 85.0);
        weatherPerformance.put("Nắng nhẹ", 90.0);
        weatherPerformance.put("Mưa vừa", 75.0);
        weatherPerformance.put("Nắng vừa", 80.0);
        weatherPerformance.put("Mưa to", 60.0);
        weatherPerformance.put("Nắng gắt", 65.0);
        
        // Tạo dữ liệu mô phỏng về hiệu suất theo nhiệt độ
        Map<String, Double> temperaturePerformance = new HashMap<>();
        temperaturePerformance.put("15-20°C", 85.0);
        temperaturePerformance.put("20-25°C", 95.0);
        temperaturePerformance.put("25-30°C", 90.0);
        temperaturePerformance.put("30-35°C", 75.0);
        temperaturePerformance.put(">35°C", 60.0);
        
        // Tạo dữ liệu mô phỏng về hiệu suất theo độ ẩm
        Map<String, Double> humidityPerformance = new HashMap<>();
        humidityPerformance.put("<40%", 70.0);
        humidityPerformance.put("40-60%", 85.0);
        humidityPerformance.put("60-80%", 90.0);
        humidityPerformance.put(">80%", 75.0);
        
        // Điều chỉnh dữ liệu dựa trên productId (nếu có)
        if (productId != null) {
            // Giả sử ta có dữ liệu cụ thể cho một số sản phẩm
            if (productId == 1) { // Hạt giống
                weatherPerformance.put("Mưa nhẹ", 90.0);
                weatherPerformance.put("Nắng nhẹ", 85.0);
                temperaturePerformance.put("20-25°C", 98.0);
                
                // Cập nhật dữ liệu chi tiết
                Map<String, Object> updatedRainyData = weatherPerformanceDetailed.get("Mưa nhẹ");
                updatedRainyData.put("averagePerformance", 90.0);
                updatedRainyData.put("salesVolume", 140);
                weatherPerformanceDetailed.put("Mưa nhẹ", updatedRainyData);
            } else if (productId == 2) { // Phân bón
                weatherPerformance.put("Mưa nhẹ", 95.0);
                weatherPerformance.put("Mưa vừa", 85.0);
                humidityPerformance.put("60-80%", 95.0);
                
                // Cập nhật dữ liệu chi tiết
                Map<String, Object> updatedRainyData = weatherPerformanceDetailed.get("Mưa nhẹ");
                updatedRainyData.put("averagePerformance", 95.0);
                updatedRainyData.put("salesVolume", 160);
                updatedRainyData.put("averageRating", 4.7);
                weatherPerformanceDetailed.put("Mưa nhẹ", updatedRainyData);
            } else if (productId == 3) { // Thuốc BVTV
                weatherPerformance.put("Nắng nhẹ", 95.0);
                weatherPerformance.put("Mưa to", 40.0); // Hiệu quả kém khi mưa to
                humidityPerformance.put("<40%", 90.0);
                
                // Cập nhật dữ liệu chi tiết
                Map<String, Object> updatedSunnyData = weatherPerformanceDetailed.get("Nắng nhẹ");
                updatedSunnyData.put("averagePerformance", 95.0);
                updatedSunnyData.put("salesVolume", 180);
                updatedSunnyData.put("trend", "Tăng mạnh");
                weatherPerformanceDetailed.put("Nắng nhẹ", updatedSunnyData);
                
                Map<String, Object> updatedHeavyRainData = weatherPerformanceDetailed.get("Mưa to");
                updatedHeavyRainData.put("averagePerformance", 40.0);
                updatedHeavyRainData.put("salesVolume", 30);
                updatedHeavyRainData.put("trend", "Giảm mạnh");
                weatherPerformanceDetailed.put("Mưa to", updatedHeavyRainData);
            }
        }
        
        // Điều chỉnh dữ liệu dựa trên khu vực (nếu có)
        if (region != null) {
            // Giả sử ta có điều chỉnh dựa trên khu vực
            if (region.equalsIgnoreCase("north")) {
                temperaturePerformance.put("15-20°C", 90.0);
                temperaturePerformance.put(">35°C", 50.0);
                
                // Cập nhật dữ liệu chi tiết theo khu vực
                for (Map.Entry<String, Map<String, Object>> entry : weatherPerformanceDetailed.entrySet()) {
                    Map<String, Object> data = entry.getValue();
                    if (entry.getKey().contains("Nắng")) {
                        data.put("regionSpecific", "Miền Bắc - Hiệu quả cao vào mùa xuân và thu");
                    } else {
                        data.put("regionSpecific", "Miền Bắc - Hiệu quả cao vào mùa hè");
                    }
                }
            } else if (region.equalsIgnoreCase("central")) {
                humidityPerformance.put("<40%", 60.0);
                temperaturePerformance.put(">35°C", 55.0);
                
                // Cập nhật dữ liệu chi tiết theo khu vực
                for (Map.Entry<String, Map<String, Object>> entry : weatherPerformanceDetailed.entrySet()) {
                    Map<String, Object> data = entry.getValue();
                    data.put("regionSpecific", "Miền Trung - Chú ý đến yếu tố hạn hán");
                }
            } else if (region.equalsIgnoreCase("south")) {
                temperaturePerformance.put("25-30°C", 95.0);
                humidityPerformance.put("60-80%", 95.0);
                
                // Cập nhật dữ liệu chi tiết theo khu vực
                for (Map.Entry<String, Map<String, Object>> entry : weatherPerformanceDetailed.entrySet()) {
                    Map<String, Object> data = entry.getValue();
                    if (entry.getKey().contains("Mưa")) {
                        data.put("regionSpecific", "Miền Nam - Hiệu quả cao vào mùa mưa");
                    } else {
                        data.put("regionSpecific", "Miền Nam - Hiệu quả cao vào mùa khô");
                    }
                }
            } else if (region.equalsIgnoreCase("highlands")) {
                temperaturePerformance.put("15-20°C", 92.0);
                humidityPerformance.put("60-80%", 88.0);
                
                // Cập nhật dữ liệu chi tiết theo khu vực
                for (Map.Entry<String, Map<String, Object>> entry : weatherPerformanceDetailed.entrySet()) {
                    Map<String, Object> data = entry.getValue();
                    data.put("regionSpecific", "Tây Nguyên - Điều kiện độ cao và nhiệt độ đặc thù");
                }
            }
        }
        
        // Tạo dữ liệu hiệu suất theo mùa vụ
        Map<String, Double> seasonalPerformance = new HashMap<>();
        seasonalPerformance.put("Xuân", 88.0);
        seasonalPerformance.put("Hè", 76.0);
        seasonalPerformance.put("Thu", 92.0);
        seasonalPerformance.put("Đông", 70.0);
        
        // Tổng hợp kết quả
        result.put("weatherPerformanceDetailed", weatherPerformanceDetailed);
        result.put("weatherPerformance", weatherPerformance);
        result.put("temperaturePerformance", temperaturePerformance);
        result.put("humidityPerformance", humidityPerformance);
        result.put("seasonalPerformance", seasonalPerformance);
        
        // Thêm thông tin về thời gian phân tích
        result.put("period", period);
        result.put("region", region != null ? region : "Toàn quốc");
        result.put("productId", productId);
        
        // Xác định điều kiện tối ưu
        Map<String, String> optimalConditions = new HashMap<>();
        optimalConditions.put("weather", getMaxKey(weatherPerformance));
        optimalConditions.put("temperature", getMaxKey(temperaturePerformance));
        optimalConditions.put("humidity", getMaxKey(humidityPerformance));
        optimalConditions.put("season", getMaxKey(seasonalPerformance));
        result.put("optimalConditions", optimalConditions);
        
        return result;
    }
    
    /**
     * Lấy key có giá trị lớn nhất trong map
     */
    private String getMaxKey(Map<String, Double> map) {
        return map.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("");
    }
    
    @Override
    public List<String> getProductOptimizationTips(Integer productId, Map<String, Object> performanceData) {
        List<String> tips = new ArrayList<>();
        
        // Trích xuất các điều kiện tối ưu
        @SuppressWarnings("unchecked")
        Map<String, String> optimalConditions = (Map<String, String>) performanceData.get("optimalConditions");
        String optimalWeather = optimalConditions.get("weather");
        String optimalTemperature = optimalConditions.get("temperature");
        String optimalHumidity = optimalConditions.get("humidity");
        String optimalSeason = optimalConditions.get("season");
        
        // Thêm lời khuyên cụ thể về điều kiện tối ưu
        tips.add("Sử dụng sản phẩm trong điều kiện thời tiết: " + optimalWeather + " để đạt hiệu suất tối đa");
        tips.add("Nhiệt độ tối ưu để sử dụng sản phẩm: " + optimalTemperature + " (hiệu suất cao hơn 15-25% so với các điều kiện khác)");
        tips.add("Độ ẩm tối ưu để sử dụng sản phẩm: " + optimalHumidity + " (tăng hiệu quả sử dụng lên đến 20%)");
        tips.add("Mùa vụ tối ưu để sử dụng sản phẩm: " + optimalSeason + " (hiệu suất cao nhất trong năm)");
        
        // Thêm lời khuyên thời gian sử dụng
        if (optimalWeather.contains("Nắng")) {
            tips.add("Sử dụng vào buổi sáng sớm hoặc chiều muộn để tránh ánh nắng gay gắt");
        } else if (optimalWeather.contains("Mưa")) {
            tips.add("Nên sử dụng sau khi mưa nhẹ khoảng 1-2 giờ để đạt hiệu quả tốt nhất");
        }
        
        // Khuyến nghị về sử dụng kết hợp
        tips.add("Kết hợp với các sản phẩm bổ trợ để tăng hiệu suất tổng thể lên 30-40%");
        
        // Thêm lời khuyên cụ thể theo loại sản phẩm
        if (productId != null) {
            switch (productId) {
                case 1: // Hạt giống
                    tips.add("Ngâm hạt giống trong nước ấm trước khi gieo để tăng tỷ lệ nảy mầm từ 70% lên 90%");
                    tips.add("Gieo hạt vào buổi sáng sớm hoặc chiều muộn để tránh nhiệt độ cao làm giảm tỷ lệ nảy mầm");
                    tips.add("Phủ một lớp đất mỏng sau khi gieo để bảo vệ hạt khỏi côn trùng và điều kiện bất lợi");
                    tips.add("Đảm bảo độ ẩm đất ổn định trong giai đoạn nảy mầm (60-70%)");
                    tips.add("Trồng vào " + optimalSeason + " để có tỷ lệ sống cao nhất và thời gian sinh trưởng ngắn nhất");
                    break;
                case 2: // Phân bón
                    tips.add("Bón phân trước khi trời mưa nhẹ để phân được ngấm tốt hơn, tăng hiệu quả hấp thụ 25-30%");
                    tips.add("Tránh bón phân khi đất quá khô hoặc quá ẩm, có thể làm giảm hiệu quả đến 40%");
                    tips.add("Bón phân đều xung quanh gốc cây, cách gốc 10-15cm để tránh làm cháy rễ");
                    tips.add("Chia nhỏ liều lượng và bón nhiều lần thay vì tập trung một lần");
                    tips.add("Kết hợp với chế phẩm vi sinh để tăng hiệu quả hấp thụ lên 20-30%");
                    break;
                case 3: // Thuốc BVTV
                    tips.add("Phun thuốc vào buổi sáng sớm hoặc chiều muộn khi trời không mưa và ít gió");
                    tips.add("Không phun thuốc khi nhiệt độ trên 35°C, hiệu quả có thể giảm đến 50%");
                    tips.add("Đảm bảo không mưa trong ít nhất 6 giờ sau khi phun thuốc để đạt hiệu quả tối đa");
                    tips.add("Sử dụng chất bám dính để tăng hiệu quả trong mùa mưa, kéo dài thời gian tác dụng thêm 2-3 ngày");
                    tips.add("Luân phiên các loại thuốc để tránh tình trạng kháng thuốc");
                    break;
                default:
                    tips.add("Đọc kỹ hướng dẫn sử dụng để đạt hiệu quả tối ưu");
                    tips.add("Điều chỉnh liều lượng sử dụng phù hợp với điều kiện thời tiết hiện tại");
                    tips.add("Theo dõi phản ứng của cây trồng và điều chỉnh phương pháp sử dụng phù hợp");
                    break;
            }
        }
        
        // Thêm lời khuyên theo khu vực (nếu có)
        String region = (String) performanceData.get("region");
        if (region != null) {
            if (region.equalsIgnoreCase("Miền Bắc")) {
                tips.add("Tại miền Bắc: Chú ý đến yếu tố mùa vụ, hiệu suất giữa các mùa chênh lệch lớn");
                tips.add("Đặc biệt chú ý trong giai đoạn giao mùa, điều chỉnh liều lượng phù hợp");
            } else if (region.equalsIgnoreCase("Miền Trung")) {
                tips.add("Tại miền Trung: Gia tăng tần suất sử dụng trong mùa khô hạn để duy trì hiệu quả");
                tips.add("Sử dụng thêm các sản phẩm bảo vệ trong mùa mưa bão");
            } else if (region.equalsIgnoreCase("Miền Nam")) {
                tips.add("Tại miền Nam: Điều chỉnh liều lượng trong mùa mưa để đảm bảo hiệu quả");
                tips.add("Tăng cường bảo vệ trong mùa nắng nóng để duy trì hiệu suất cao");
            } else if (region.equalsIgnoreCase("Tây Nguyên")) {
                tips.add("Tại Tây Nguyên: Chú ý đến chênh lệch nhiệt ngày-đêm, điều chỉnh thời điểm sử dụng phù hợp");
                tips.add("Kết hợp với biện pháp giữ ẩm để tăng hiệu quả trong mùa khô");
            }
        }
        
        // Thêm lời khuyên về thời gian hiệu lực
        tips.add("Thời gian hiệu lực tối đa: " + (productId == 2 ? "30-45 ngày" : productId == 3 ? "7-10 ngày" : "Theo mùa vụ"));
        
        // Cảnh báo về điều kiện bất lợi
        tips.add("Cảnh báo: Hiệu suất giảm mạnh trong điều kiện " + getWorstCondition(performanceData) + ", hạn chế sử dụng nếu có thể");
        
        return tips;
    }
    
    /**
     * Xác định điều kiện bất lợi nhất cho sản phẩm
     */
    private String getWorstCondition(Map<String, Object> performanceData) {
        String worstCondition = "";
        double lowestPerformance = 100.0;
        
        // Xác định điều kiện thời tiết tồi nhất
        @SuppressWarnings("unchecked")
        Map<String, Double> weatherPerformance = (Map<String, Double>) performanceData.get("weatherPerformance");
        for (Map.Entry<String, Double> entry : weatherPerformance.entrySet()) {
            if (entry.getValue() < lowestPerformance) {
                lowestPerformance = entry.getValue();
                worstCondition = entry.getKey();
            }
        }
        
        return worstCondition;
    }
    
    @Override
    public Map<String, Object> predictFutureProductPerformance(Integer productId, String region) {
        Map<String, Object> result = new HashMap<>();
        
        // Tạo dữ liệu dự báo cho thời gian sắp tới
        List<Map<String, Object>> performancePredictions = new ArrayList<>();
        
        // Dự báo cho 7 ngày tới
        String[] weatherConditions = {
            "Nắng nhẹ", "Nắng nhẹ", "Mưa nhẹ", "Mây rải rác", 
            "Nắng vừa", "Nắng vừa", "Mưa vừa"
        };
        
        // Tạo hiệu suất dự kiến cho mỗi ngày
        for (int i = 0; i < 7; i++) {
            Map<String, Object> dailyPrediction = new HashMap<>();
            
            // Ngày dự báo
            LocalDateTime forecastDate = LocalDateTime.now().plusDays(i);
            dailyPrediction.put("date", forecastDate.toString());
            
            // Điều kiện thời tiết dự kiến
            String weather = weatherConditions[i];
            dailyPrediction.put("weather", weather);
            
            // Nhiệt độ dự kiến
            double temperature = 25 + Math.random() * 10 - 5; // 20-30°C
            dailyPrediction.put("temperature", Math.round(temperature * 10) / 10.0);
            
            // Độ ẩm dự kiến
            int humidity = 60 + (int)(Math.random() * 30 - 15); // 45-75%
            dailyPrediction.put("humidity", humidity);
            
            // Tính hiệu suất dự kiến dựa trên điều kiện thời tiết
            double basePerformance = 80.0; // Hiệu suất cơ bản
            
            // Điều chỉnh theo thời tiết
            if (weather.contains("Nắng nhẹ")) basePerformance += 10.0;
            else if (weather.contains("Mưa nhẹ")) basePerformance += 5.0;
            else if (weather.contains("Nắng vừa")) basePerformance -= 0.0;
            else if (weather.contains("Mưa vừa")) basePerformance -= 5.0;
            else if (weather.contains("Mây")) basePerformance += 2.0;
            
            // Điều chỉnh theo nhiệt độ
            if (temperature >= 20 && temperature <= 25) basePerformance += 8.0;
            else if (temperature > 25 && temperature <= 30) basePerformance += 5.0;
            else if (temperature > 30) basePerformance -= 10.0;
            else if (temperature < 20) basePerformance -= 5.0;
            
            // Điều chỉnh theo độ ẩm
            if (humidity >= 60 && humidity <= 80) basePerformance += 7.0;
            else if (humidity > 80) basePerformance -= 3.0;
            else if (humidity < 50) basePerformance -= 7.0;
            
            // Điều chỉnh theo loại sản phẩm (nếu có)
            if (productId != null) {
                switch (productId) {
                    case 1: // Hạt giống
                        if (weather.contains("Mưa")) basePerformance += 10.0;
                        if (humidity > 70) basePerformance += 8.0;
                        break;
                    case 2: // Phân bón
                        if (weather.contains("Mưa nhẹ")) basePerformance += 15.0;
                        if (humidity >= 60 && humidity <= 80) basePerformance += 10.0;
                        break;
                    case 3: // Thuốc BVTV
                        if (weather.contains("Nắng")) basePerformance += 12.0;
                        if (weather.contains("Mưa to")) basePerformance -= 25.0;
                        break;
                }
            }
            
            // Điều chỉnh theo khu vực (nếu có)
            if (region != null) {
                if (region.equalsIgnoreCase("north")) {
                    if (i < 3) basePerformance += 5.0; // Hiệu suất tốt hơn vào đầu tuần
                } else if (region.equalsIgnoreCase("central")) {
                    if (weather.contains("Mưa")) basePerformance -= 5.0; // Mưa ở miền Trung thường mạnh hơn
                } else if (region.equalsIgnoreCase("south")) {
                    if (weather.contains("Nắng")) basePerformance += 3.0; // Ánh nắng đều hơn ở miền Nam
                }
            }
            
            // Giới hạn hiệu suất trong khoảng 0-100%
            basePerformance = Math.max(0, Math.min(100, basePerformance));
            
            dailyPrediction.put("performance", Math.round(basePerformance * 10) / 10.0);
            
            // Thêm vào danh sách dự báo
            performancePredictions.add(dailyPrediction);
        }
        
        // Thêm khuyến nghị sử dụng
        List<String> usageRecommendations = new ArrayList<>();
        
        // Tìm ngày có hiệu suất tốt nhất
        int bestDay = 0;
        double bestPerformance = 0.0;
        for (int i = 0; i < performancePredictions.size(); i++) {
            double perf = (double) performancePredictions.get(i).get("performance");
            if (perf > bestPerformance) {
                bestPerformance = perf;
                bestDay = i;
            }
        }
        
        // Thêm khuyến nghị cho ngày tốt nhất
        usageRecommendations.add("Ngày tối ưu để sử dụng sản phẩm: " + 
            LocalDateTime.now().plusDays(bestDay).toLocalDate().toString() +
            " (hiệu suất dự kiến: " + bestPerformance + "%)");
        
        // Thêm khuyến nghị cho các điều kiện không tốt
        for (int i = 0; i < performancePredictions.size(); i++) {
            Map<String, Object> day = performancePredictions.get(i);
            double perf = (double) day.get("performance");
            if (perf < 70) {
                usageRecommendations.add("Hạn chế sử dụng vào ngày " + 
                    LocalDateTime.now().plusDays(i).toLocalDate().toString() +
                    " do điều kiện thời tiết " + day.get("weather") + 
                    " không thuận lợi (hiệu suất dự kiến: " + perf + "%)");
            }
        }
        
        // Khuyến nghị chung
        usageRecommendations.add("Điều chỉnh lịch sử dụng sản phẩm dựa trên dự báo thời tiết để tối ưu hiệu quả");
        usageRecommendations.add("Chuẩn bị các biện pháp bảo vệ nếu thời tiết thay đổi bất ngờ");
        
        // Tổng hợp kết quả
        result.put("performancePredictions", performancePredictions);
        result.put("usageRecommendations", usageRecommendations);
        result.put("region", region != null ? region : "Toàn quốc");
        result.put("productId", productId);
        
        // Tính hiệu suất trung bình
        double avgPerformance = performancePredictions.stream()
                .mapToDouble(map -> (double) map.get("performance"))
                .average()
                .orElse(0.0);
        result.put("averagePerformance", Math.round(avgPerformance * 10) / 10.0);
        
        // Xác định xu hướng
        String trend;
        double firstPerformance = (double) performancePredictions.get(0).get("performance");
        double lastPerformance = (double) performancePredictions.get(performancePredictions.size() - 1).get("performance");
        
        if (lastPerformance > firstPerformance + 5) {
            trend = "Tăng";
        } else if (lastPerformance < firstPerformance - 5) {
            trend = "Giảm";
        } else {
            trend = "Ổn định";
        }
        result.put("trend", trend);
        
        return result;
    }
} 