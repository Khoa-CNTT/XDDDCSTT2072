package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.config.OpenWeatherConfig;
import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;
import com.agricultural.agricultural.dto.WeatherDataDTO;
import com.agricultural.agricultural.entity.AgriculturalAdvice;
import com.agricultural.agricultural.entity.WeatherData;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.AgriculturalAdviceMapper;
import com.agricultural.agricultural.mapper.WeatherDataMapper;
import com.agricultural.agricultural.repository.IAgriculturalAdviceRepository;
import com.agricultural.agricultural.repository.IWeatherDataRepository;
import com.agricultural.agricultural.service.IWeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService implements IWeatherService {

    private final IWeatherDataRepository weatherDataRepository;
    private final IAgriculturalAdviceRepository agriculturalAdviceRepository;
    private final WeatherDataMapper weatherDataMapper;
    private final AgriculturalAdviceMapper agriculturalAdviceMapper;
    private final OpenWeatherConfig openWeatherConfig;
    private final RestTemplate restTemplate;
    
    // Cache để giảm số lượng request API
    private Map<String, WeatherDataDTO> weatherCache = new HashMap<>();
    private LocalDateTime lastCleanupTime = LocalDateTime.now();

    @Override
    public WeatherDataDTO getCurrentWeather(String city, String country) {
        if (city == null || city.trim().isEmpty()) {
            throw new BadRequestException("Tên thành phố không được để trống");
        }
        
        if (country == null || country.trim().isEmpty()) {
            throw new BadRequestException("Tên quốc gia không được để trống");
        }
        
        // Tạo key cho cache
        String cacheKey = city.toLowerCase() + "," + country.toLowerCase();
        
        // Kiểm tra cache trước
        if (weatherCache.containsKey(cacheKey)) {
            WeatherDataDTO cachedData = weatherCache.get(cacheKey);
            // Cache hợp lệ trong 30 phút
            if (cachedData.getRequestTime().isAfter(LocalDateTime.now().minusMinutes(30))) {
                return cachedData;
            }
        }
        
        // Kiểm tra database có dữ liệu gần đây không
        Optional<WeatherData> recentData = weatherDataRepository
                .findFirstByCityIgnoreCaseAndCountryIgnoreCaseOrderByDataTimeDesc(city, country);
        
        if (recentData.isPresent() && 
            recentData.get().getDataTime().isAfter(LocalDateTime.now().minusMinutes(60))) {
            WeatherDataDTO dto = weatherDataMapper.toDTO(recentData.get());
            // Lưu vào cache
            weatherCache.put(cacheKey, dto);
            return dto;
        }
        
        // Dọn cache nếu đã lâu chưa dọn
        if (lastCleanupTime.isBefore(LocalDateTime.now().minusHours(1))) {
            cleanupCache();
        }
        
        try {
            // Gọi API OpenWeather
            String url = UriComponentsBuilder
                    .fromHttpUrl(openWeatherConfig.getCurrentWeatherUrl())
                    .queryParam("q", city + "," + country)
                    .queryParam("appid", openWeatherConfig.getApiKey())
                    .queryParam("units", "metric")
                    .queryParam("lang", "vi")
                    .build()
                    .toUriString();
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            // Chuyển đổi dữ liệu từ API thành entity và lưu vào database
            WeatherData weatherData = mapOpenWeatherResponse(response.getBody());
            weatherData = weatherDataRepository.save(weatherData);
            
            // Tạo lời khuyên nông nghiệp
            generateAgriculturalAdvice(weatherData);
            
            WeatherDataDTO dto = weatherDataMapper.toDTO(weatherData);
            // Lưu vào cache
            weatherCache.put(cacheKey, dto);
            return dto;
        } catch (RestClientException e) {
            log.error("Lỗi khi lấy dữ liệu thời tiết từ API: " + e.getMessage());
            // Nếu không kết nối được API, trả về dữ liệu cũ nhất từ database (nếu có)
            if (recentData.isPresent()) {
                return weatherDataMapper.toDTO(recentData.get());
            }
            throw new BadRequestException("Không thể lấy dữ liệu thời tiết: " + e.getMessage());
        }
    }

    @Override
    public List<WeatherDataDTO> getWeatherHistory(String city, String country, LocalDateTime startTime) {
        if (city == null || city.trim().isEmpty()) {
            throw new BadRequestException("Tên thành phố không được để trống");
        }
        
        if (country == null || country.trim().isEmpty()) {
            throw new BadRequestException("Tên quốc gia không được để trống");
        }
        
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(7); // Mặc định lấy 7 ngày gần nhất
        }
        
        // API miễn phí không hỗ trợ dữ liệu lịch sử, chỉ trả về từ database
        List<WeatherData> weatherDataList = weatherDataRepository.findRecentWeatherData(city, country, startTime);
        return weatherDataList.stream()
                .map(weatherDataMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WeatherDataDTO getCurrentWeatherByCoordinates(Double latitude, Double longitude) {
        if (latitude == null) {
            throw new BadRequestException("Vĩ độ không được để trống");
        }
        
        if (longitude == null) {
            throw new BadRequestException("Kinh độ không được để trống");
        }
        
        // Tạo key cho cache
        String cacheKey = latitude + "," + longitude;
        
        // Kiểm tra cache trước
        if (weatherCache.containsKey(cacheKey)) {
            WeatherDataDTO cachedData = weatherCache.get(cacheKey);
            // Cache hợp lệ trong 30 phút
            if (cachedData.getRequestTime().isAfter(LocalDateTime.now().minusMinutes(30))) {
                return cachedData;
            }
        }
        
        // Kiểm tra database có dữ liệu gần đây không
        Optional<WeatherData> recentData = weatherDataRepository
                .findFirstByLatitudeAndLongitudeOrderByDataTimeDesc(latitude, longitude);
        
        if (recentData.isPresent() && 
            recentData.get().getDataTime().isAfter(LocalDateTime.now().minusMinutes(60))) {
            WeatherDataDTO dto = weatherDataMapper.toDTO(recentData.get());
            // Lưu vào cache
            weatherCache.put(cacheKey, dto);
            return dto;
        }
        
        try {
            // Gọi API OpenWeather
            String url = UriComponentsBuilder
                    .fromHttpUrl(openWeatherConfig.getCurrentWeatherUrl())
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("appid", openWeatherConfig.getApiKey())
                    .queryParam("units", "metric")
                    .queryParam("lang", "vi")
                    .build()
                    .toUriString();
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            // Chuyển đổi dữ liệu từ API thành entity và lưu vào database
            WeatherData weatherData = mapOpenWeatherResponse(response.getBody());
            weatherData = weatherDataRepository.save(weatherData);
            
            // Tạo lời khuyên nông nghiệp
            generateAgriculturalAdvice(weatherData);
            
            WeatherDataDTO dto = weatherDataMapper.toDTO(weatherData);
            // Lưu vào cache
            weatherCache.put(cacheKey, dto);
            return dto;
        } catch (RestClientException e) {
            log.error("Lỗi khi lấy dữ liệu thời tiết từ API: " + e.getMessage());
            // Nếu không kết nối được API, trả về dữ liệu cũ nhất từ database (nếu có)
            if (recentData.isPresent()) {
                return weatherDataMapper.toDTO(recentData.get());
            }
            throw new BadRequestException("Không thể lấy dữ liệu thời tiết: " + e.getMessage());
        }
    }

    @Override
    public List<String> searchCities(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Từ khóa tìm kiếm không được để trống");
        }
        
        return weatherDataRepository.findDistinctCitiesByKeyword(keyword);
    }

    @Override
    public Optional<AgriculturalAdviceDTO> getLatestAgriculturalAdvice(String city, String country) {
        if (city == null || city.trim().isEmpty()) {
            throw new BadRequestException("Tên thành phố không được để trống");
        }
        
        if (country == null || country.trim().isEmpty()) {
            throw new BadRequestException("Tên quốc gia không được để trống");
        }
        
        return agriculturalAdviceRepository.findLatestByLocation(city, country)
                .map(agriculturalAdviceMapper::toDTO);
    }

    @Override
    public List<AgriculturalAdviceDTO> getAgriculturalAdviceHistory(String city, String country) {
        if (city == null || city.trim().isEmpty()) {
            throw new BadRequestException("Tên thành phố không được để trống");
        }
        
        if (country == null || country.trim().isEmpty()) {
            throw new BadRequestException("Tên quốc gia không được để trống");
        }
        
        List<AgriculturalAdvice> adviceList = agriculturalAdviceRepository.findByLocation(city, country);
        return adviceList.stream()
                .map(agriculturalAdviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgriculturalAdviceDTO> getPlantingAdvice() {
        List<AgriculturalAdvice> adviceList = agriculturalAdviceRepository.findByIsSuitableForPlantingTrueOrderByCreatedAtDesc();
        return adviceList.stream()
                .map(agriculturalAdviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgriculturalAdviceDTO> getHarvestingAdvice() {
        List<AgriculturalAdvice> adviceList = agriculturalAdviceRepository.findByIsSuitableForHarvestingTrueOrderByCreatedAtDesc();
        return adviceList.stream()
                .map(agriculturalAdviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Phương thức hỗ trợ để chuyển đổi dữ liệu từ API OpenWeather sang entity WeatherData
    private WeatherData mapOpenWeatherResponse(Map data) {
        WeatherData weatherData = new WeatherData();
        
        Map<String, Object> main = (Map<String, Object>) data.get("main");
        Map<String, Object> wind = (Map<String, Object>) data.get("wind");
        List<Map<String, Object>> weather = (List<Map<String, Object>>) data.get("weather");
        Map<String, Object> sys = (Map<String, Object>) data.get("sys");
        Map<String, Object> coord = (Map<String, Object>) data.get("coord");
        
        weatherData.setCity((String) data.get("name"));
        weatherData.setCountry((String) sys.get("country"));
        weatherData.setLatitude(((Number) coord.get("lat")).doubleValue());
        weatherData.setLongitude(((Number) coord.get("lon")).doubleValue());
        weatherData.setTemperature(((Number) main.get("temp")).doubleValue());
        weatherData.setHumidity(((Number) main.get("humidity")).intValue());
        weatherData.setWindSpeed(((Number) wind.get("speed")).doubleValue());
        
        Map<String, Object> weatherDetails = weather.get(0);
        weatherData.setWeatherDescription((String) weatherDetails.get("description"));
        weatherData.setIconCode((String) weatherDetails.get("icon"));
        
        weatherData.setRequestTime(LocalDateTime.now());
        weatherData.setDataTime(LocalDateTime.ofEpochSecond(
                ((Number) data.get("dt")).longValue(), 
                0, 
                ZoneOffset.UTC)
        );
        
        return weatherData;
    }

    // Phương thức hỗ trợ để tạo lời khuyên nông nghiệp dựa trên dữ liệu thời tiết
    private void generateAgriculturalAdvice(WeatherData weatherData) {
        AgriculturalAdvice advice = new AgriculturalAdvice();
        advice.setWeatherData(weatherData);
        
        // Tạo tóm tắt thời tiết
        StringBuilder weatherSummary = new StringBuilder();
        weatherSummary.append("Thời tiết tại ")
                .append(weatherData.getCity())
                .append(": ")
                .append(weatherData.getWeatherDescription())
                .append(", nhiệt độ ")
                .append(weatherData.getTemperature())
                .append("°C, độ ẩm ")
                .append(weatherData.getHumidity())
                .append("%, tốc độ gió ")
                .append(weatherData.getWindSpeed())
                .append(" m/s.");
        
        advice.setWeatherSummary(weatherSummary.toString());
        
        // Xác định điều kiện thời tiết
        double temp = weatherData.getTemperature();
        int humidity = weatherData.getHumidity();
        double windSpeed = weatherData.getWindSpeed();
        String description = weatherData.getWeatherDescription().toLowerCase();
        
        boolean isRainy = description.contains("mưa") || description.contains("rain");
        boolean isCloudy = description.contains("mây") || description.contains("cloud");
        boolean isSunny = description.contains("nắng") || description.contains("sun") || description.contains("clear");
        boolean isWindy = windSpeed > 5.0;
        
        advice.setIsRainySeason(isRainy);
        advice.setIsDrySeason(!isRainy && humidity < 50);
        
        // Tạo lời khuyên canh tác
        StringBuilder farmingAdvice = new StringBuilder();
        if (isRainy) {
            farmingAdvice.append("Thời tiết mưa, nên hạn chế phun thuốc bảo vệ thực vật. ");
            advice.setIsSuitableForPlanting(true);
            advice.setIsSuitableForHarvesting(false);
        } else if (isSunny && temp > 32) {
            farmingAdvice.append("Thời tiết nắng nóng, cần tưới nước cho cây trồng vào sáng sớm hoặc chiều tối. ");
            advice.setIsSuitableForPlanting(false);
            advice.setIsSuitableForHarvesting(true);
        } else if (isCloudy) {
            farmingAdvice.append("Thời tiết có mây, thích hợp cho việc chăm sóc cây trồng. ");
            advice.setIsSuitableForPlanting(true);
            advice.setIsSuitableForHarvesting(true);
        }
        
        if (isWindy) {
            farmingAdvice.append("Gió mạnh, cần gia cố nhà kính và các công trình nông nghiệp. ");
        }
        
        advice.setFarmingAdvice(farmingAdvice.toString());
        
        // Tạo lời khuyên về cây trồng
        StringBuilder cropAdvice = new StringBuilder();
        if (temp < 20) {
            cropAdvice.append("Nhiệt độ thấp phù hợp cho rau họ cải (bắp cải, súp lơ, cải thìa). ");
        } else if (temp >= 20 && temp < 28) {
            cropAdvice.append("Nhiệt độ trung bình phù hợp cho nhiều loại rau quả như cà chua, ớt, dưa chuột. ");
        } else {
            cropAdvice.append("Nhiệt độ cao phù hợp cho cây nhiệt đới như đậu, bắp, khoai lang. ");
        }
        
        if (humidity > 80) {
            cropAdvice.append("Độ ẩm cao, cần lưu ý phòng trừ nấm bệnh. ");
        } else if (humidity < 40) {
            cropAdvice.append("Độ ẩm thấp, cần tăng cường tưới nước. ");
        }
        
        advice.setCropAdvice(cropAdvice.toString());
        
        // Tạo cảnh báo nếu cần thiết
        StringBuilder warnings = new StringBuilder();
        if (isRainy && weatherData.getTemperature() < 20) {
            warnings.append("Thời tiết mưa lạnh có thể ảnh hưởng xấu đến cây trồng non. ");
        }
        
        if (temp > 35) {
            warnings.append("Nhiệt độ quá cao, cần che phủ cho cây trồng và tăng cường tưới nước. ");
        }
        
        if (windSpeed > 10.0) {
            warnings.append("Gió mạnh có thể gây ngã đổ cây trồng cao. ");
        }
        
        advice.setWarnings(warnings.length() > 0 ? warnings.toString() : null);
        
        // Tạo hoạt động đề xuất
        StringBuilder activities = new StringBuilder();
        if (advice.getIsSuitableForPlanting()) {
            activities.append("Trồng cây mới. ");
        }
        
        if (advice.getIsSuitableForHarvesting()) {
            activities.append("Thu hoạch nông sản. ");
        }
        
        if (isRainy) {
            activities.append("Kiểm tra hệ thống thoát nước. ");
        } else if (isSunny) {
            activities.append("Tưới nước. Làm giàn che nắng cho cây. ");
        }
        
        advice.setRecommendedActivities(activities.toString());
        
        // Lưu lời khuyên
        agriculturalAdviceRepository.save(advice);
    }
    
    // Dọn cache để tránh memory leak
    private void cleanupCache() {
        Iterator<Map.Entry<String, WeatherDataDTO>> iterator = weatherCache.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, WeatherDataDTO> entry = iterator.next();
            if (entry.getValue().getRequestTime().isBefore(LocalDateTime.now().minusHours(2))) {
                iterator.remove();
            }
        }
        lastCleanupTime = LocalDateTime.now();
    }
} 