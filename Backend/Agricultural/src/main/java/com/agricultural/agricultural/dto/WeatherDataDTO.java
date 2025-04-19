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
public class WeatherDataDTO {
    private Integer id;
    
    @NotBlank(message = "Tên thành phố không được để trống")
    private String city;
    
    @NotBlank(message = "Tên quốc gia không được để trống")
    private String country;
    
    @NotNull(message = "Vĩ độ không được để trống")
    private Double latitude;
    
    @NotNull(message = "Kinh độ không được để trống")
    private Double longitude;
    
    @NotNull(message = "Nhiệt độ không được để trống")
    private Double temperature;
    
    @NotNull(message = "Độ ẩm không được để trống")
    private Integer humidity;
    
    @NotNull(message = "Tốc độ gió không được để trống")
    private Double windSpeed;
    
    private String weatherDescription;
    
    private String iconCode;
    
    private LocalDateTime requestTime;
    
    private LocalDateTime dataTime;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 