package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.NotNull;
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
    
    @NotNull(message = "ID người dùng không được để trống")
    private Integer userId;
    
    @NotNull(message = "ID địa điểm không được để trống")
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