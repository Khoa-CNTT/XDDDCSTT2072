package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.WeatherMonitoredLocationDTO;
import com.agricultural.agricultural.entity.WeatherMonitoredLocation;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.WeatherMonitoredLocationMapper;
import com.agricultural.agricultural.repository.IWeatherMonitoredLocationRepository;
import com.agricultural.agricultural.service.IWeatherLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeatherLocationService implements IWeatherLocationService {
    
    private final IWeatherMonitoredLocationRepository locationRepository;
    private final WeatherMonitoredLocationMapper locationMapper;
    
    @Override
    public List<WeatherMonitoredLocationDTO> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(locationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<WeatherMonitoredLocationDTO> getActiveLocations() {
        return locationRepository.findByIsActiveTrue().stream()
                .map(locationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Optional<WeatherMonitoredLocationDTO> getLocationById(Integer id) {
        if (id == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        return locationRepository.findById(id)
                .map(locationMapper::toDTO);
    }
    
    @Override
    public Optional<WeatherMonitoredLocationDTO> getLocationByCityAndCountry(String city, String country) {
        if (city == null || city.trim().isEmpty()) {
            throw new BadRequestException("Tên thành phố không được để trống");
        }
        
        if (country == null || country.trim().isEmpty()) {
            throw new BadRequestException("Tên quốc gia không được để trống");
        }
        
        return locationRepository.findByCityIgnoreCaseAndCountryIgnoreCase(city, country)
                .map(locationMapper::toDTO);
    }
    
    @Override
    public List<WeatherMonitoredLocationDTO> searchLocationsByName(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Từ khóa tìm kiếm không được để trống");
        }
        
        return locationRepository.searchByName(keyword).stream()
                .map(locationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<WeatherMonitoredLocationDTO> searchLocationsByCity(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Từ khóa tìm kiếm không được để trống");
        }
        
        return locationRepository.searchByCity(keyword).stream()
                .map(locationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public WeatherMonitoredLocationDTO saveLocation(WeatherMonitoredLocationDTO locationDTO) {
        if (locationDTO == null) {
            throw new BadRequestException("Thông tin địa điểm không được để trống");
        }
        
        if (locationDTO.getName() == null || locationDTO.getName().trim().isEmpty()) {
            throw new BadRequestException("Tên địa điểm không được để trống");
        }
        
        if (locationDTO.getCity() == null || locationDTO.getCity().trim().isEmpty()) {
            throw new BadRequestException("Tên thành phố không được để trống");
        }
        
        if (locationDTO.getCountry() == null || locationDTO.getCountry().trim().isEmpty()) {
            throw new BadRequestException("Tên quốc gia không được để trống");
        }
        
        if (locationDTO.getLatitude() == null || locationDTO.getLongitude() == null) {
            throw new BadRequestException("Tọa độ (vĩ độ, kinh độ) không được để trống");
        }
        
        WeatherMonitoredLocation location = locationMapper.toEntity(locationDTO);
        location = locationRepository.save(location);
        return locationMapper.toDTO(location);
    }
    
    @Override
    @Transactional
    public WeatherMonitoredLocationDTO updateLocationStatus(Integer id, Boolean isActive) {
        if (id == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        if (isActive == null) {
            throw new BadRequestException("Trạng thái không được để trống");
        }
        
        WeatherMonitoredLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa điểm với ID: " + id));
        
        location.setIsActive(isActive);
        location = locationRepository.save(location);
        return locationMapper.toDTO(location);
    }
    
    @Override
    @Transactional
    public void deleteLocation(Integer id) {
        if (id == null) {
            throw new BadRequestException("ID địa điểm không được để trống");
        }
        
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy địa điểm với ID: " + id);
        }
        
        locationRepository.deleteById(id);
    }
} 