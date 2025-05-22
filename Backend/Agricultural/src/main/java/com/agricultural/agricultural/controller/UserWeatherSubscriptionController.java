package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.UserWeatherSubscriptionDTO;
import com.agricultural.agricultural.service.IUserWeatherSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/weather-subscriptions")
@RequiredArgsConstructor
public class UserWeatherSubscriptionController {

    private final IUserWeatherSubscriptionService subscriptionService;


    @GetMapping
    public ResponseEntity<List<UserWeatherSubscriptionDTO>> getCurrentUserSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getCurrentUserSubscriptions());
    }


    @GetMapping("/{locationId}")
    public ResponseEntity<?> getCurrentUserSubscription(
            @PathVariable String locationId) {
        try {
            Integer locationIdInt = Integer.parseInt(locationId);
            return subscriptionService.getCurrentUserSubscription(locationIdInt)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        }
    }


    @PostMapping("/{locationId}")
    public ResponseEntity<?> subscribeToLocation(
            @PathVariable String locationId,
            @RequestParam(defaultValue = "true") Boolean enableNotifications) {
        try {
            Integer locationIdInt = Integer.parseInt(locationId);
            UserWeatherSubscriptionDTO result = 
                    subscriptionService.subscribeCurrentUserToLocation(locationIdInt, enableNotifications);
            return ResponseEntity.ok(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    @PatchMapping("/{locationId}/notifications")
    public ResponseEntity<?> updateNotificationStatus(
            @PathVariable String locationId,
            @RequestParam Boolean enableNotifications) {
        try {
            Integer locationIdInt = Integer.parseInt(locationId);
            subscriptionService.updateCurrentUserNotificationStatus(locationIdInt, enableNotifications);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    @DeleteMapping("/{locationId}")
    public ResponseEntity<?> unsubscribeFromLocation(
            @PathVariable String locationId) {
        try {
            Integer locationIdInt = Integer.parseInt(locationId);
            subscriptionService.unsubscribeCurrentUserFromLocation(locationIdInt);
            return ResponseEntity.noContent().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> getUserSubscriptions(@PathVariable String userId) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            return ResponseEntity.ok(subscriptionService.getUserSubscriptions(userIdInt));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID người dùng không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    @GetMapping("/users/{userId}/locations/{locationId}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> getUserSubscription(
            @PathVariable String userId,
            @PathVariable String locationId) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            Integer locationIdInt = Integer.parseInt(locationId);
            return subscriptionService.getSubscription(userIdInt, locationIdInt)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    @PatchMapping("/users/{userId}/locations/{locationId}/notifications")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> updateUserNotificationStatus(
            @PathVariable String userId,
            @PathVariable String locationId,
            @RequestParam Boolean enableNotifications) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            Integer locationIdInt = Integer.parseInt(locationId);
            subscriptionService.updateNotificationStatus(userIdInt, locationIdInt, enableNotifications);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    @DeleteMapping("/users/{userId}/locations/{locationId}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<?> unsubscribeUserFromLocation(
            @PathVariable String userId,
            @PathVariable String locationId) {
        try {
            Integer userIdInt = Integer.parseInt(userId);
            Integer locationIdInt = Integer.parseInt(locationId);
            subscriptionService.unsubscribeFromLocation(userIdInt, locationIdInt);
            return ResponseEntity.noContent().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Định dạng ID không hợp lệ");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    

    @GetMapping("/active-notifications")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<List<UserWeatherSubscriptionDTO>> getActiveNotificationSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getActiveNotificationSubscriptions());
    }
} 