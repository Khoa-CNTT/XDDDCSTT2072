package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "agricultural_advice")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgriculturalAdvice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "weather_data_id", nullable = false)
    private WeatherData weatherData;
    
    @Column(name = "weather_summary", nullable = false)
    private String weatherSummary;
    
    @Column(name = "farming_advice")
    private String farmingAdvice;
    
    @Column(name = "crop_advice")
    private String cropAdvice;
    
    @Column(name = "warnings")
    private String warnings;
    
    @Column(name = "is_rainy_season")
    private Boolean isRainySeason;
    
    @Column(name = "is_dry_season")
    private Boolean isDrySeason;
    
    @Column(name = "is_suitable_for_planting")
    private Boolean isSuitableForPlanting;
    
    @Column(name = "is_suitable_for_harvesting")
    private Boolean isSuitableForHarvesting;
    
    @Column(name = "recommended_activities")
    private String recommendedActivities;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 