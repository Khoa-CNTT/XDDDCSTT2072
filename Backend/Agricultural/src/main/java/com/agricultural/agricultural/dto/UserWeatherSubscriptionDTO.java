package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWeatherSubscriptionDTO {
    private Integer id;
    private Integer userId;
    private Integer locationId;
    private Boolean enableNotifications;
    private WeatherMonitoredLocationDTO location;
    private String userName;
    private String locationName;
    private String city;
    private String country;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 