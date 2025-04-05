package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherMonitoredLocationDTO {
    private Integer id;
    private String name;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private Boolean isActive;
    private Integer monitoringFrequency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 