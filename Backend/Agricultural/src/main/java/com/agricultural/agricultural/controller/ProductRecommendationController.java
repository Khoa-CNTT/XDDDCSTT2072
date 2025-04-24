package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IProductRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationController {

    private final IProductRecommendationService recommendationService;
    private final IUserRepository userRepository;

    /**
     * Lấy danh sách sản phẩm gợi ý cho người dùng hiện tại
     * @param page Số trang (bắt đầu từ 0)
     * @param size Kích thước trang
     * @return Danh sách sản phẩm gợi ý
     */
    @GetMapping("/personalized")
    public ResponseEntity<ApiResponse<Page<MarketPlaceDTO>>> getPersonalizedRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Lấy gợi ý cá nhân hóa - trang: {}, kích thước: {}", page, size);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Vui lòng đăng nhập để nhận gợi ý cá nhân", null));
        }

        String username = authentication.getName();
        Optional<User> user = userRepository.findByUserName(username);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Người dùng không tồn tại", null));
        }

        Integer userId = user.get().getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<MarketPlaceDTO> recommendations = recommendationService.getPersonalizedRecommendations(userId, pageable);

        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gợi ý thành công", recommendations));
    }


    /**
     * Lấy danh sách sản phẩm tương tự với sản phẩm đang xem
     * @param productId ID của sản phẩm
     * @param page Số trang (bắt đầu từ 0)
     * @param size Kích thước trang
     * @return Danh sách sản phẩm tương tự
     */
    @GetMapping("/similar/{productId}")
    public ResponseEntity<ApiResponse<Page<MarketPlaceDTO>>> getSimilarProducts(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        
        log.info("Lấy sản phẩm tương tự - productId: {}, trang: {}, kích thước: {}", productId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        
        // Ghi nhận lượt xem nếu người dùng đã đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            try {
                Integer userId = Integer.parseInt(authentication.getName());
                recommendationService.recordProductView(userId, productId);
            } catch (Exception e) {
                log.error("Lỗi khi ghi nhận lượt xem", e);
            }
        }
        
        Page<MarketPlaceDTO> similarProducts = recommendationService.getSimilarProducts(productId, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm tương tự thành công", similarProducts));
    }

    /**
     * Lấy danh sách sản phẩm thường được mua cùng
     * @param productId ID của sản phẩm
     * @param limit Số lượng tối đa
     * @return Danh sách sản phẩm thường được mua cùng
     */
    @GetMapping("/bought-together/{productId}")
    public ResponseEntity<ApiResponse<List<MarketPlaceDTO>>> getFrequentlyBoughtTogether(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "5") int limit) {
        
        log.info("Lấy sản phẩm thường mua cùng - productId: {}, limit: {}", productId, limit);
        
        List<MarketPlaceDTO> boughtTogether = recommendationService.getFrequentlyBoughtTogether(productId, limit);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm thường mua cùng thành công", boughtTogether));
    }

    /**
     * Lấy danh sách sản phẩm xu hướng
     * @param page Số trang (bắt đầu từ 0)
     * @param size Kích thước trang
     * @return Danh sách sản phẩm xu hướng
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<MarketPlaceDTO>>> getTrendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Lấy sản phẩm xu hướng - trang: {}, kích thước: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MarketPlaceDTO> trendingProducts = recommendationService.getTrendingProducts(pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sản phẩm xu hướng thành công", trendingProducts));
    }
} 