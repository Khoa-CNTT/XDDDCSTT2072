package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface IWeatherService {
    
    // Lấy dữ liệu thời tiết hiện tại cho một thành phố
    // @param city Tên thành phố
    // @param country Mã quốc gia (2 ký tự)
    // @return Dữ liệu thời tiết
    WeatherDataDTO getCurrentWeather(String city, String country);
    
    // Lấy lịch sử dữ liệu thời tiết cho một thành phố
    // @param city Tên thành phố
    // @param country Mã quốc gia (2 ký tự)
    // @param startTime Thời điểm bắt đầu
    // @return Danh sách dữ liệu thời tiết
    List<WeatherDataDTO> getWeatherHistory(String city, String country, LocalDateTime startTime);
    
    // Lấy dữ liệu thời tiết hiện tại theo tọa độ
    // @param latitude Vĩ độ
    // @param longitude Kinh độ
    // @return Dữ liệu thời tiết
    WeatherDataDTO getCurrentWeatherByCoordinates(Double latitude, Double longitude);
    
    // Tìm kiếm các thành phố theo từ khóa
    // @param keyword Từ khóa tìm kiếm
    // @return Danh sách tên thành phố
    List<String> searchCities(String keyword);
    
    // Lấy lời khuyên nông nghiệp mới nhất cho một thành phố
    // @param city Tên thành phố
    // @param country Mã quốc gia (2 ký tự)
    // @return Lời khuyên nông nghiệp
    Optional<AgriculturalAdviceDTO> getLatestAgriculturalAdvice(String city, String country);
    
    // Lấy danh sách các lời khuyên nông nghiệp cho một thành phố
    // @param city Tên thành phố
    // @param country Mã quốc gia (2 ký tự)
    // @return Danh sách lời khuyên nông nghiệp
    List<AgriculturalAdviceDTO> getAgriculturalAdviceHistory(String city, String country);
    
    // Lấy các lời khuyên phù hợp cho việc trồng trọt
    // @return Danh sách lời khuyên nông nghiệp phù hợp cho việc trồng trọt
    List<AgriculturalAdviceDTO> getPlantingAdvice();
    
    // Lấy các lời khuyên phù hợp cho việc thu hoạch
    // @return Danh sách lời khuyên nông nghiệp phù hợp cho việc thu hoạch
    List<AgriculturalAdviceDTO> getHarvestingAdvice();
    
    /**
     * Dự báo thời tiết cho một khoảng thời gian
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @param days Số ngày dự báo
     * @return Danh sách dữ liệu thời tiết dự báo
     */
    List<WeatherDataDTO> getWeatherForecast(String city, String country, int days);
    
    /**
     * Dự đoán các hiện tượng thời tiết khắc nghiệt sắp xảy ra
     * 
     * @param city Tên thành phố
     * @param country Mã quốc gia
     * @param forecastDays Số ngày dự báo
     * @return Thông tin về các hiện tượng thời tiết khắc nghiệt
     */
    Map<String, Object> predictExtremeWeather(String city, String country, int forecastDays);
} 