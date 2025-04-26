package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherMonitoredLocationDTO {
    private Integer id;
    
    @NotBlank(message = "Tên địa điểm không được để trống")
    private String name;
    
    @NotBlank(message = "Tên thành phố không được để trống")
    private String city;
    
    @NotBlank(message = "Tên quốc gia không được để trống")
    private String country;
    
    @NotNull(message = "Vĩ độ không được để trống")
    private Double latitude;
    
    @NotNull(message = "Kinh độ không được để trống")
    private Double longitude;
    
    private Boolean isActive;
    
    private Integer monitoringFrequency;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 