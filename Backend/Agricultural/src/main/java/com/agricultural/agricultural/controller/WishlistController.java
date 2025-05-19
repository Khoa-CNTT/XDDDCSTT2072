package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.WishlistDTO;
import com.agricultural.agricultural.dto.WishlistItemDTO;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.WishlistService;
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

    /**
     * Lấy ID người dùng từ username trong Authentication
     * @param authentication Thông tin xác thực
     * @return ID người dùng hoặc null nếu không tìm thấy
     */
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

    /**
     * Get all wishlists for the current user
     */
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

    /**
     * Get a specific wishlist with its items
     */
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

    /**
     * Create a new wishlist
     */
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

    /**
     * Update an existing wishlist
     */
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

    /**
     * Delete a wishlist
     */
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

    /**
     * Add an item to a wishlist
     */
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

    /**
     * Remove an item from a wishlist
     */
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

    /**
     * Create default wishlist for the current user
     */
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
    
    /**
     * Move an item between wishlists
     */
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