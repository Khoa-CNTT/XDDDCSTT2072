package com.agricultural.agricultural.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenWeatherConfig {

    @Value("${openweather.api-key}")
    private String apiKey;

    @Value("${openweather.api-url}")
    private String apiUrl;

    @Bean(name = "weatherRestTemplate")
    public RestTemplate weatherRestTemplate() {
        return new RestTemplate();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getCurrentWeatherUrl() {
        return apiUrl + "/weather";
    }

    public String getForecastUrl() {
        return apiUrl + "/forecast";
    }

    public String getOneCallUrl() {
        return apiUrl + "/onecall";
    }
} 