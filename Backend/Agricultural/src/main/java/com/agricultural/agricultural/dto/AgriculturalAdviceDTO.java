package com.agricultural.agricultural.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgriculturalAdviceDTO {
    private Integer id;
    
    @Valid
    @NotNull(message = "Dữ liệu thời tiết không được để trống")
    private WeatherDataDTO weatherData;
    
    @NotBlank(message = "Tóm tắt thời tiết không được để trống")
    @Size(max = 500, message = "Tóm tắt thời tiết không được vượt quá 500 ký tự")
    private String weatherSummary;
    
    @NotBlank(message = "Lời khuyên canh tác không được để trống")
    @Size(max = 1000, message = "Lời khuyên canh tác không được vượt quá 1000 ký tự")
    private String farmingAdvice;
    
    @Size(max = 1000, message = "Lời khuyên về cây trồng không được vượt quá 1000 ký tự")
    private String cropAdvice;
    
    @Size(max = 500, message = "Cảnh báo không được vượt quá 500 ký tự")
    private String warnings;
    
    private Boolean isRainySeason;
    private Boolean isDrySeason;
    private Boolean isSuitableForPlanting;
    private Boolean isSuitableForHarvesting;
    
    @Size(max = 1000, message = "Hoạt động đề xuất không được vượt quá 1000 ký tự")
    private String recommendedActivities;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 