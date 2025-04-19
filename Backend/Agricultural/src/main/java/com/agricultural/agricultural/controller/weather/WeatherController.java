package com.agricultural.agricultural.controller.weather;

import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;
import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.service.IWeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final IWeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<WeatherDataDTO> getCurrentWeather(
            @RequestParam String city,
            @RequestParam String country) {
        return ResponseEntity.ok(weatherService.getCurrentWeather(city, country));
    }

    @GetMapping("/coordinates")
    public ResponseEntity<WeatherDataDTO> getWeatherByCoordinates(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        return ResponseEntity.ok(weatherService.getCurrentWeatherByCoordinates(latitude, longitude));
    }

    @GetMapping("/history")
    public ResponseEntity<List<WeatherDataDTO>> getWeatherHistory(
            @RequestParam String city,
            @RequestParam String country,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        // Giới hạn lịch sử chỉ trong 7 ngày gần nhất (vì dùng API free, chỉ lấy từ database)
        LocalDate limitDate = LocalDate.now().minusDays(7);
        if (startDate.isBefore(limitDate)) {
            startDate = limitDate;
        }
        
        LocalDateTime startDateTime = LocalDateTime.of(startDate, LocalTime.MIDNIGHT);
        return ResponseEntity.ok(weatherService.getWeatherHistory(city, country, startDateTime));
    }

    @GetMapping("/cities/search")
    public ResponseEntity<List<String>> searchCities(@RequestParam String keyword) {
        // Giới hạn số lượng kết quả
        List<String> cities = weatherService.searchCities(keyword);
        if (cities.size() > 10) {
            cities = cities.subList(0, 10);
        }
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/advice/latest")
    public ResponseEntity<AgriculturalAdviceDTO> getLatestAdvice(
            @RequestParam String city,
            @RequestParam String country) {
        Optional<AgriculturalAdviceDTO> advice = weatherService.getLatestAgriculturalAdvice(city, country);
        return advice.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/advice/history")
    public ResponseEntity<List<AgriculturalAdviceDTO>> getAdviceHistory(
            @RequestParam String city,
            @RequestParam String country) {
        List<AgriculturalAdviceDTO> adviceList = weatherService.getAgriculturalAdviceHistory(city, country);
        // Giới hạn số lượng kết quả
        if (adviceList.size() > 10) {
            adviceList = adviceList.subList(0, 10);
        }
        return ResponseEntity.ok(adviceList);
    }

    @GetMapping("/advice/planting")
    public ResponseEntity<List<AgriculturalAdviceDTO>> getPlantingAdvice() {
        List<AgriculturalAdviceDTO> adviceList = weatherService.getPlantingAdvice();
        // Giới hạn số lượng kết quả
        if (adviceList.size() > 10) {
            adviceList = adviceList.subList(0, 10);
        }
        return ResponseEntity.ok(adviceList);
    }

    @GetMapping("/advice/harvesting")
    public ResponseEntity<List<AgriculturalAdviceDTO>> getHarvestingAdvice() {
        List<AgriculturalAdviceDTO> adviceList = weatherService.getHarvestingAdvice();
        // Giới hạn số lượng kết quả
        if (adviceList.size() > 10) {
            adviceList = adviceList.subList(0, 10);
        }
        return ResponseEntity.ok(adviceList);
    }
} 