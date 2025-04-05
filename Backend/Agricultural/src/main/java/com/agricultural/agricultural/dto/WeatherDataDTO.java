package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDataDTO {
    private Integer id;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private Double temperature;
    private Integer humidity;
    private Double windSpeed;
    private String weatherDescription;
    private String iconCode;
    private LocalDateTime requestTime;
    private LocalDateTime dataTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 