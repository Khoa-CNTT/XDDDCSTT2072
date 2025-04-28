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
        return getProductsByWeatherCondition(weatherData);
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
        
        // Lọc sản phẩm theo điều kiện thời tiết
        if (description.contains("mưa") || description.contains("rain")) {
            // Sản phẩm phù hợp với thời tiết mưa
            return filterProductsByCategories(allProducts, 
                "Rau củ", "Hạt giống", "Phân bón");
        } else if (temperature > 30) {
            // Sản phẩm phù hợp với thời tiết nóng
            return filterProductsByCategories(allProducts,
                "Trái cây", "Thiết bị");
        } else if (humidity < 40) {
            // Sản phẩm phù hợp với độ ẩm thấp
            return filterProductsByCategories(allProducts,
                "Thiết bị", "Bảo quản");
        } else {
            // Thời tiết bình thường
            return filterProductsByCategories(allProducts,
                "Rau củ", "Trái cây", "Hoa");
        }
    }
    
    private List<MarketPlaceDTO> filterProductsByCategories(List<MarketPlace> products, String... categoryNames) {
        Set<String> categoryNameSet = new HashSet<>(Arrays.asList(categoryNames));
        
        // Lấy các danh mục từ repository
        List<ProductCategory> categories = productCategoryRepository.findByNameIn(categoryNameSet);
        Set<Integer> categoryIds = categories.stream()
            .map(ProductCategory::getId)
            .collect(Collectors.toSet());
        
        return products.stream()
            .filter(product -> product.getCategory() != null && 
                   categoryIds.contains(product.getCategory().getId()))
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
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
} 