package com.agricultural.agricultural.controller.weather;

import com.agricultural.agricultural.dto.UserWeatherSubscriptionDTO;
import com.agricultural.agricultural.dto.WeatherMonitoredLocationDTO;
import com.agricultural.agricultural.service.IUserWeatherSubscriptionService;
import com.agricultural.agricultural.service.IWeatherLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/weather/locations")
@RequiredArgsConstructor
public class WeatherLocationController {

    private final IWeatherLocationService locationService;
    private final IUserWeatherSubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<List<WeatherMonitoredLocationDTO>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<WeatherMonitoredLocationDTO>> getActiveLocations() {
        return ResponseEntity.ok(locationService.getActiveLocations());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<WeatherMonitoredLocationDTO> getLocationById(@PathVariable String id) {
        try {
            Integer locationId = Integer.parseInt(id);
            return locationService.getLocationById(locationId)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<WeatherMonitoredLocationDTO> getLocationByCityAndCountry(
            @RequestParam String city,
            @RequestParam String country) {
        return locationService.getLocationByCityAndCountry(city, country)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/subscribers")
    public ResponseEntity<?> getLocationSubscribers(@PathVariable String id) {
        try {
            Integer locationId = Integer.parseInt(id);
            List<UserWeatherSubscriptionDTO> subscribers = subscriptionService.getLocationSubscribers(locationId);
            return ResponseEntity.ok(subscribers);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<WeatherMonitoredLocationDTO> createLocation(
            @RequestBody WeatherMonitoredLocationDTO locationDTO) {
        return ResponseEntity.ok(locationService.saveLocation(locationDTO));
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateLocationStatus(
            @PathVariable String id,
            @RequestParam Boolean isActive) {
        try {
            Integer locationId = Integer.parseInt(id);
            return ResponseEntity.ok(locationService.updateLocationStatus(locationId, isActive));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable String id) {
        try {
            Integer locationId = Integer.parseInt(id);
            locationService.deleteLocation(locationId);
            return ResponseEntity.noContent().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
} 