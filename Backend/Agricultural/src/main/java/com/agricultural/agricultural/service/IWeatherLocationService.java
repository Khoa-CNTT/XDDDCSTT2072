package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.WeatherMonitoredLocationDTO;
import java.util.List;
import java.util.Optional;

public interface IWeatherLocationService {
    
    // Lấy tất cả các địa điểm đang được theo dõi
    // @return Danh sách địa điểm
    List<WeatherMonitoredLocationDTO> getAllLocations();
    
    // Lấy tất cả các địa điểm đang hoạt động
    // @return Danh sách địa điểm
    List<WeatherMonitoredLocationDTO> getActiveLocations();
    
    // Lấy thông tin địa điểm theo ID
    // @param id ID của địa điểm
    // @return Thông tin địa điểm
    Optional<WeatherMonitoredLocationDTO> getLocationById(Integer id);
    
    // Lấy thông tin địa điểm theo tên thành phố và quốc gia
    // @param city Tên thành phố
    // @param country Mã quốc gia (2 ký tự)
    // @return Thông tin địa điểm
    Optional<WeatherMonitoredLocationDTO> getLocationByCityAndCountry(String city, String country);
    
    // Tìm kiếm địa điểm theo tên
    // @param keyword Từ khóa tìm kiếm
    // @return Danh sách địa điểm
    List<WeatherMonitoredLocationDTO> searchLocationsByName(String keyword);
    
    // Tìm kiếm địa điểm theo tên thành phố
    // @param keyword Từ khóa tìm kiếm
    // @return Danh sách địa điểm
    List<WeatherMonitoredLocationDTO> searchLocationsByCity(String keyword);
    
    // Tạo hoặc cập nhật địa điểm
    // @param locationDTO Thông tin địa điểm
    // @return Thông tin địa điểm sau khi lưu
    WeatherMonitoredLocationDTO saveLocation(WeatherMonitoredLocationDTO locationDTO);
    
    // Cập nhật trạng thái hoạt động của địa điểm
    // @param id ID của địa điểm
    // @param isActive Trạng thái hoạt động
    // @return Thông tin địa điểm sau khi cập nhật
    WeatherMonitoredLocationDTO updateLocationStatus(Integer id, Boolean isActive);
    
    // Xóa địa điểm
    // @param id ID của địa điểm
    void deleteLocation(Integer id);
} 