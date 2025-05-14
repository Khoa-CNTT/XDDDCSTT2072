package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.SeasonalRecommendationDTO;
import com.agricultural.agricultural.dto.WeatherDataDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Service interface cho việc kết hợp dữ liệu thời tiết với sản phẩm nông nghiệp
 * Cung cấp các chức năng gợi ý sản phẩm dựa vào điều kiện thời tiết và mùa vụ
 */
public interface IMarketPlaceWeatherService {

    /**
     * Lấy sản phẩm phù hợp với điều kiện thời tiết hiện tại ở một địa điểm
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Danh sách sản phẩm phù hợp với điều kiện thời tiết hiện tại
     */
    List<MarketPlaceDTO> getProductsForCurrentWeather(String city, String country);
    
    /**
     * Lấy sản phẩm phù hợp cho mùa mưa
     * 
     * @param pageable Thông tin phân trang
     * @return Danh sách sản phẩm phù hợp với mùa mưa
     */
    Page<MarketPlaceDTO> getProductsForRainySeason(Pageable pageable);
    
    /**
     * Lấy sản phẩm phù hợp cho mùa khô
     * 
     * @param pageable Thông tin phân trang
     * @return Danh sách sản phẩm phù hợp với mùa khô
     */
    Page<MarketPlaceDTO> getProductsForDrySeason(Pageable pageable);
    
    /**
     * Lấy sản phẩm phù hợp cho việc trồng trọt dựa vào điều kiện thời tiết hiện tại
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Danh sách sản phẩm phù hợp cho việc trồng trọt
     */
    List<MarketPlaceDTO> getProductsForPlanting(String city, String country);
    
    /**
     * Lấy sản phẩm phù hợp cho việc thu hoạch dựa vào điều kiện thời tiết hiện tại
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Danh sách sản phẩm phù hợp cho việc thu hoạch
     */
    List<MarketPlaceDTO> getProductsForHarvesting(String city, String country);
    
    /**
     * Lấy thông tin khuyến mãi theo mùa vụ và thời tiết
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Thông tin khuyến mãi và sản phẩm khuyến mãi
     */
    Map<String, Object> getSeasonalPromotions(String city, String country);
    
    /**
     * Lấy danh sách chi tiết các gợi ý sản phẩm dựa trên điều kiện thời tiết và mùa vụ
     * Cung cấp các gợi ý được phân loại thành nhiều nhóm với thông tin chi tiết
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @return Danh sách các gợi ý chi tiết
     */
    List<SeasonalRecommendationDTO> getDetailedRecommendations(String city, String country);

    /**
     * Lấy sản phẩm phù hợp với cây trồng cụ thể dựa trên thời tiết hiện tại
     * 
     * @param cropType Loại cây trồng
     * @param weatherData Dữ liệu thời tiết hiện tại
     * @param pageable Thông tin phân trang
     * @return Danh sách sản phẩm phù hợp với cây trồng trong điều kiện thời tiết
     */
    Page<MarketPlaceDTO> getProductsByCropAndWeather(String cropType, WeatherDataDTO weatherData, Pageable pageable);
    
    /**
     * Dự đoán các hiện tượng thời tiết khắc nghiệt sắp xảy ra
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @param forecastDays Số ngày dự báo
     * @return Thông tin về các hiện tượng thời tiết khắc nghiệt
     */
    Map<String, Object> predictExtremeWeather(String city, String country, int forecastDays);
    
    /**
     * Lấy danh sách sản phẩm phù hợp cho việc đối phó với thời tiết khắc nghiệt
     * 
     * @param extremeWeather Thông tin thời tiết khắc nghiệt
     * @return Danh sách sản phẩm phân loại theo loại thời tiết khắc nghiệt
     */
    Map<String, List<MarketPlaceDTO>> getProductsForExtremeWeather(Map<String, Object> extremeWeather);
    
    /**
     * Lấy lời khuyên cho việc đối phó với thời tiết khắc nghiệt
     * 
     * @param extremeWeather Thông tin thời tiết khắc nghiệt
     * @return Danh sách lời khuyên
     */
    List<String> getExtremeWeatherAdvice(Map<String, Object> extremeWeather);
    
    /**
     * Phân tích hiệu suất của sản phẩm dựa trên dữ liệu thời tiết
     * 
     * @param productId ID sản phẩm cần phân tích
     * @param region Khu vực phân tích
     * @param period Khoảng thời gian phân tích (tính bằng tháng)
     * @return Dữ liệu phân tích
     */
    Map<String, Object> analyzeProductPerformanceByWeather(Integer productId, String region, int period);
    
    /**
     * Lấy các khuyến nghị tối ưu việc sử dụng sản phẩm
     * 
     * @param productId ID sản phẩm
     * @param performanceData Dữ liệu hiệu suất
     * @return Danh sách khuyến nghị
     */
    List<String> getProductOptimizationTips(Integer productId, Map<String, Object> performanceData);
    
    /**
     * Dự đoán hiệu suất sản phẩm trong tương lai dựa trên dự báo thời tiết
     * 
     * @param productId ID sản phẩm
     * @param region Khu vực
     * @return Dữ liệu dự đoán
     */
    Map<String, Object> predictFutureProductPerformance(Integer productId, String region);
} 