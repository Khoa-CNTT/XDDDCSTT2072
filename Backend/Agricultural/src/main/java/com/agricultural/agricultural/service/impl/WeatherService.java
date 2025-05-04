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
import com.agricultural.agricultural.service.INotificationService;
import com.agricultural.agricultural.dto.NotificationDTO;
import com.agricultural.agricultural.entity.UserWeatherSubscription;
import com.agricultural.agricultural.repository.IUserWeatherSubscriptionRepository;
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
    private final IUserWeatherSubscriptionRepository subscriptionRepository;
    private final INotificationService notificationService;

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
            processWeatherAlert(weatherData);
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
            processWeatherAlert(weatherData);
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
        if (Boolean.TRUE.equals(advice.getIsSuitableForPlanting())) {
            activities.append("Trồng cây mới. ");
        }

        if (Boolean.TRUE.equals(advice.getIsSuitableForHarvesting())) {
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

    private void processWeatherAlert(WeatherData weatherData) {
        if (shouldSendAlert(weatherData)) {
            // Tìm những người đăng ký nhận thông báo thời tiết cho khu vực này
            List<UserWeatherSubscription> subscriptions = subscriptionRepository.findByLocationId(weatherData.getId());
            for (UserWeatherSubscription subscription : subscriptions) {
                sendWeatherAlert(subscription.getUser().getId(), weatherData);
            }
        }
    }

    private boolean shouldSendAlert(WeatherData weatherData) {
        if (weatherData.getTemperature() != null && weatherData.getTemperature() > 35) return true;
        if (weatherData.getTemperature() != null && weatherData.getTemperature() < 10) return true;
        if (weatherData.getWindSpeed() != null && weatherData.getWindSpeed() > 20) return true;
        String condition = weatherData.getWeatherDescription();
        if (condition != null && (condition.contains("bão") || condition.contains("lũ") || condition.contains("lụt") || condition.contains("storm") || condition.contains("hurricane") || condition.contains("typhoon")))
            return true;
        return false;
    }

    private void sendWeatherAlert(Integer userId, WeatherData weatherData) {
        String alertMessage = createAlertMessage(weatherData);
        NotificationDTO notification = NotificationDTO.builder()
                .userId(userId)
                .title("Cảnh báo thời tiết!")
                .message("Khu vực " + weatherData.getCity() + ": " + alertMessage)
                .type("WEATHER_ALERT")
                .redirectUrl("/weather/" + weatherData.getId())
                .build();
        notificationService.sendRealTimeNotification(notification);
    }

    private String createAlertMessage(WeatherData weatherData) {
        StringBuilder message = new StringBuilder();
        if (weatherData.getTemperature() != null && weatherData.getTemperature() > 35)
            message.append("Nhiệt độ cao (").append(weatherData.getTemperature()).append("°C). ");
        else if (weatherData.getTemperature() != null && weatherData.getTemperature() < 10)
            message.append("Nhiệt độ thấp (").append(weatherData.getTemperature()).append("°C). ");
        if (weatherData.getWindSpeed() != null && weatherData.getWindSpeed() > 20)
            message.append("Gió mạnh (").append(weatherData.getWindSpeed()).append("m/s). ");
        if (weatherData.getWeatherDescription() != null) message.append(weatherData.getWeatherDescription());
        return message.toString();
    }

    @Override
    public List<WeatherDataDTO> getWeatherForecast(String city, String country, int days) {
        log.info("Lấy dự báo thời tiết cho: {} ngày ở địa điểm: {}, {}", days, city, country);
        
        // Giới hạn số ngày dự báo
        int forecastDays = Math.min(days, 14);
        
        List<WeatherDataDTO> forecastList = new ArrayList<>();
        
        try {
            // Lấy thời tiết hiện tại làm cơ sở
            WeatherDataDTO currentWeather = getCurrentWeather(city, country);
            forecastList.add(currentWeather);
            
            // Để demo, ta sẽ tạo dữ liệu dự báo giả lập
            Random random = new Random();
            LocalDateTime startDate = LocalDateTime.now().plusDays(1);
            
            // Các thông số cơ bản từ thời tiết hiện tại
            double baseTemp = currentWeather.getTemperature();
            int baseHumidity = currentWeather.getHumidity();
            double baseWindSpeed = currentWeather.getWindSpeed();
            
            // Các mô tả thời tiết phổ biến
            String[] weatherDescriptions = {
                "Trời nắng", "Mây rải rác", "Mưa nhẹ", 
                "Mưa vừa", "Mưa to", "Nắng gắt", 
                "Nhiều mây", "Nắng nhẹ", "Mưa rào"
            };
            
            for (int i = 1; i < forecastDays; i++) {
                WeatherDataDTO forecast = new WeatherDataDTO();
                
                // Ngày dự báo
                LocalDateTime forecastDate = startDate.plusDays(i-1);
                forecast.setDataTime(forecastDate);
                
                // Nhiệt độ dao động +/- 3 độ so với ngày trước
                double tempVariation = random.nextDouble() * 6 - 3; // -3 đến +3
                double forecastTemp = baseTemp + tempVariation;
                forecast.setTemperature(Math.round(forecastTemp * 10) / 10.0); // Làm tròn 1 chữ số thập phân
                
                // Độ ẩm dao động +/- 10%
                int humidityVariation = random.nextInt(21) - 10; // -10 đến +10
                int forecastHumidity = baseHumidity + humidityVariation;
                forecast.setHumidity(Math.max(0, Math.min(100, forecastHumidity))); // Đảm bảo trong khoảng 0-100
                
                // Tốc độ gió
                double windVariation = random.nextDouble() * 4 - 2; // -2 đến +2
                double forecastWind = baseWindSpeed + windVariation;
                forecast.setWindSpeed(Math.max(0, Math.round(forecastWind * 10) / 10.0)); // Làm tròn và đảm bảo không âm
                
                // Mô tả thời tiết
                String weatherDesc = weatherDescriptions[random.nextInt(weatherDescriptions.length)];
                forecast.setWeatherDescription(weatherDesc);
                
                // Áp suất
//                forecast.setPressure(currentWeather.getPressure() + random.nextInt(11) - 5); // +/- 5
                
                // Cập nhật giá trị cơ sở cho ngày tiếp theo
                baseTemp = forecast.getTemperature();
                baseHumidity = forecast.getHumidity();
                baseWindSpeed = forecast.getWindSpeed();
                
                forecastList.add(forecast);
            }
            
            return forecastList;
        } catch (Exception e) {
            log.error("Lỗi khi lấy dự báo thời tiết: {}", e.getMessage());
            // Trả về danh sách dự báo mặc định nếu có lỗi
            return createDefaultForecast(forecastDays);
        }
    }
    
    private List<WeatherDataDTO> createDefaultForecast(int days) {
        List<WeatherDataDTO> defaultForecast = new ArrayList<>();
        
        LocalDateTime startDate = LocalDateTime.now();
        String[] defaultDescriptions = {"Trời nắng", "Mây rải rác", "Trời nắng", "Mây rải rác", "Mưa nhẹ", "Trời nắng", "Trời nắng"};
        
        for (int i = 0; i < days; i++) {
            WeatherDataDTO forecast = new WeatherDataDTO();
            forecast.setDataTime(startDate.plusDays(i));
            forecast.setTemperature(30.0);
            forecast.setHumidity(70);
            forecast.setWindSpeed(5.0);
//            forecast.setPressure(1010);
            forecast.setWeatherDescription(defaultDescriptions[i % defaultDescriptions.length]);
            
            defaultForecast.add(forecast);
        }
        
        return defaultForecast;
    }
    
    @Override
    public Map<String, Object> predictExtremeWeather(String city, String country, int forecastDays) {
        log.info("Dự đoán thời tiết khắc nghiệt cho: {} ngày ở địa điểm: {}, {}", forecastDays, city, country);
        
        // Lấy dữ liệu dự báo thời tiết
        List<WeatherDataDTO> forecast = getWeatherForecast(city, country, forecastDays);
        
        Map<String, Object> extremeWeatherMap = new HashMap<>();
        Map<String, Integer> extremeEventCounter = new HashMap<>();
        
        // Phân tích dự báo thời tiết tìm các hiện tượng khắc nghiệt
        for (WeatherDataDTO data : forecast) {
            String description = data.getWeatherDescription().toLowerCase();
            double temperature = data.getTemperature();
            int humidity = data.getHumidity();
            double windSpeed = data.getWindSpeed();
            
            // Kiểm tra mưa lớn
            if (description.contains("mưa lớn") || description.contains("mưa to") || 
                description.contains("heavy rain") || description.contains("thunderstorm")) {
                extremeEventCounter.put("heavyRain", extremeEventCounter.getOrDefault("heavyRain", 0) + 1);
            }
            
            // Kiểm tra nắng nóng
            if (temperature > 35) {
                extremeEventCounter.put("heatwave", extremeEventCounter.getOrDefault("heatwave", 0) + 1);
            }
            
            // Kiểm tra khô hạn
            if (temperature > 30 && humidity < 40) {
                extremeEventCounter.put("drought", extremeEventCounter.getOrDefault("drought", 0) + 1);
            }
            
            // Kiểm tra gió mạnh
            if (windSpeed > 10) {
                extremeEventCounter.put("strongWind", extremeEventCounter.getOrDefault("strongWind", 0) + 1);
            }
        }
        
        // Xác định các hiện tượng thời tiết khắc nghiệt chính
        for (Map.Entry<String, Integer> entry : extremeEventCounter.entrySet()) {
            if (entry.getValue() >= 2) { // Nếu hiện tượng xảy ra ít nhất 2 ngày
                switch (entry.getKey()) {
                    case "heavyRain":
                        extremeWeatherMap.put("type", "heavyRain");
                        extremeWeatherMap.put("name", "Mưa lớn/Dông bão");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                    case "heatwave":
                        extremeWeatherMap.put("type", "heatwave");
                        extremeWeatherMap.put("name", "Nắng nóng");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                    case "drought":
                        extremeWeatherMap.put("type", "drought");
                        extremeWeatherMap.put("name", "Khô hạn");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                    case "strongWind":
                        extremeWeatherMap.put("type", "strongWind");
                        extremeWeatherMap.put("name", "Gió mạnh");
                        extremeWeatherMap.put("days", entry.getValue());
                        extremeWeatherMap.put("severity", entry.getValue() > 3 ? "Cao" : "Trung bình");
                        extremeWeatherMap.put("startDate", forecast.get(0).getDataTime());
                        break;
                }
            }
        }
        
        // Nếu không có hiện tượng thời tiết khắc nghiệt nào
        if (extremeWeatherMap.isEmpty()) {
            extremeWeatherMap.put("type", "normal");
            extremeWeatherMap.put("name", "Thời tiết bình thường");
            extremeWeatherMap.put("severity", "Thấp");
        }
        
        return extremeWeatherMap;
    }
} 