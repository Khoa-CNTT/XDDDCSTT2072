package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.WeatherMonitoredLocationDTO;
import com.agricultural.agricultural.entity.WeatherMonitoredLocation;
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
        return locationRepository.findById(id)
                .map(locationMapper::toDTO);
    }
    
    @Override
    public Optional<WeatherMonitoredLocationDTO> getLocationByCityAndCountry(String city, String country) {
        return locationRepository.findByCityIgnoreCaseAndCountryIgnoreCase(city, country)
                .map(locationMapper::toDTO);
    }
    
    @Override
    public List<WeatherMonitoredLocationDTO> searchLocationsByName(String keyword) {
        return locationRepository.searchByName(keyword).stream()
                .map(locationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<WeatherMonitoredLocationDTO> searchLocationsByCity(String keyword) {
        return locationRepository.searchByCity(keyword).stream()
                .map(locationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public WeatherMonitoredLocationDTO saveLocation(WeatherMonitoredLocationDTO locationDTO) {
        WeatherMonitoredLocation location = locationMapper.toEntity(locationDTO);
        location = locationRepository.save(location);
        return locationMapper.toDTO(location);
    }
    
    @Override
    @Transactional
    public WeatherMonitoredLocationDTO updateLocationStatus(Integer id, Boolean isActive) {
        WeatherMonitoredLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with id: " + id));
        
        location.setIsActive(isActive);
        location = locationRepository.save(location);
        return locationMapper.toDTO(location);
    }
    
    @Override
    @Transactional
    public void deleteLocation(Integer id) {
        locationRepository.deleteById(id);
    }
} 