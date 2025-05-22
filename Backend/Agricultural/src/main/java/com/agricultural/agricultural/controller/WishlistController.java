package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.WishlistDTO;
import com.agricultural.agricultural.dto.WishlistItemDTO;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.impl.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;


    private Integer getUserIdFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("DEBUG: Tìm user với username: " + username);
        System.out.println("DEBUG: Authentication principal: " + authentication.getPrincipal());
        System.out.println("DEBUG: Authentication class: " + authentication.getClass().getName());
        
        Optional<User> user = userRepository.findByUserName(username);
        if (user.isEmpty()) {
            System.out.println("DEBUG: Không tìm thấy user bằng username, thử tìm bằng email");
            // Thử tìm bằng email trong trường hợp getName() trả về email
            user = userRepository.findByEmail(username);
            if (user.isEmpty()) {
                System.out.println("DEBUG: Không tìm thấy user bằng email");
                return null;
            } else {
                System.out.println("DEBUG: Đã tìm thấy user bằng email: " + user.get().getId());
            }
        } else {
            System.out.println("DEBUG: Đã tìm thấy user bằng username: " + user.get().getId());
        }
        return user.get().getId();
    }

    @GetMapping
    public ResponseEntity<?> getUserWishlists(Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return wishlistService.getUserWishlists(userId);
    }


    @GetMapping("/{wishlistId}")
    public ResponseEntity<?> getWishlistById(@PathVariable Integer wishlistId,
                                           Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return wishlistService.getWishlistById(wishlistId, userId);
    }


    @PostMapping
    public ResponseEntity<?> createWishlist(@RequestBody @Valid WishlistDTO wishlistDTO,
                                          Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        wishlistDTO.setUserId(userId);
        return wishlistService.createWishlist(wishlistDTO);
    }


    @PutMapping("/{wishlistId}")
    public ResponseEntity<?> updateWishlist(@PathVariable Integer wishlistId,
                                          @RequestBody @Valid WishlistDTO wishlistDTO,
                                          Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return wishlistService.updateWishlist(wishlistId, wishlistDTO, userId);
    }


    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<?> deleteWishlist(@PathVariable Integer wishlistId,
                                         Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return wishlistService.deleteWishlist(wishlistId, userId);
    }


    @PostMapping("/{wishlistId}/items")
    public ResponseEntity<?> addItemToWishlist(@PathVariable Integer wishlistId,
                                            @RequestBody @Valid WishlistItemDTO itemDTO,
                                            Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return wishlistService.addItemToWishlist(wishlistId, itemDTO, userId);
    }


    @DeleteMapping("/{wishlistId}/items/{itemId}")
    public ResponseEntity<?> removeItemFromWishlist(@PathVariable Integer wishlistId,
                                                 @PathVariable Integer itemId,
                                                 Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return wishlistService.removeItemFromWishlist(wishlistId, itemId, userId);
    }


    @PostMapping("/default")
    public ResponseEntity<?> createDefaultWishlist(Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return ResponseEntity.ok(wishlistService.createDefaultWishlist(userId));
    }
    

    @PostMapping("/{sourceWishlistId}/items/{itemId}/move/{targetWishlistId}")
    public ResponseEntity<?> moveItemBetweenWishlists(@PathVariable Integer sourceWishlistId,
                                                   @PathVariable Integer targetWishlistId,
                                                   @PathVariable Integer itemId,
                                                   Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "message", "No user found with username: " + authentication.getName()
            ));
        }
        return wishlistService.moveItemBetweenWishlists(sourceWishlistId, targetWishlistId, itemId, userId);
    }
} 