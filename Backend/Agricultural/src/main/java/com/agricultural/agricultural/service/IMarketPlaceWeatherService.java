package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.SeasonalRecommendationDTO;
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
} 