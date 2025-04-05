package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgriculturalAdviceDTO {
    private Integer id;
    private WeatherDataDTO weatherData;
    private String weatherSummary;
    private String farmingAdvice;
    private String cropAdvice;
    private String warnings;
    private Boolean isRainySeason;
    private Boolean isDrySeason;
    private Boolean isSuitableForPlanting;
    private Boolean isSuitableForHarvesting;
    private String recommendedActivities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 