package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.request.FlashSaleRequest;
import com.agricultural.agricultural.dto.request.FlashSaleItemRequest;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.dto.response.FlashSaleResponse;
import com.agricultural.agricultural.enums.FlashSaleStatus;
import com.agricultural.agricultural.service.IFlashSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/flash-sales")
@RequiredArgsConstructor
@Slf4j
public class FlashSaleController {

    private final IFlashSaleService flashSaleService;

    @PostMapping
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> createFlashSale(@Valid @RequestBody FlashSaleRequest request) {
        log.info("Yêu cầu tạo flash sale mới: {}", request);
        FlashSaleResponse response = flashSaleService.createFlashSale(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo flash sale thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> updateFlashSale(
            @PathVariable Integer id,
            @Valid @RequestBody FlashSaleRequest request) {
        log.info("Yêu cầu cập nhật flash sale ID {}: {}", id, request);
        FlashSaleResponse response = flashSaleService.updateFlashSale(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật flash sale thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<Void>> deleteFlashSale(@PathVariable Integer id) {
        log.info("Yêu cầu xóa flash sale ID: {}", id);
        flashSaleService.deleteFlashSale(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa flash sale thành công", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> getFlashSaleById(@PathVariable Integer id) {
        log.info("Lấy chi tiết flash sale ID: {}", id);
        FlashSaleResponse response = flashSaleService.getFlashSaleById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin flash sale thành công", response));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getFlashSalesByStatus(@PathVariable String status) {
        log.info("Yêu cầu lấy danh sách flash sale theo trạng thái: {}", status);
        try {
            FlashSaleStatus validStatus = FlashSaleStatus.valueOf(status.toUpperCase());
            List<FlashSaleResponse> responses = flashSaleService.getFlashSalesByStatus(validStatus);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách flash sale thành công", responses));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Trạng thái flash sale không hợp lệ: " + status, null));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getActiveFlashSales() {
        log.info("Yêu cầu lấy danh sách flash sale đang hoạt động");
        List<FlashSaleResponse> responses = flashSaleService.getActiveFlashSales();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách flash sale đang hoạt động thành công", responses));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getUpcomingFlashSales() {
        log.info("Yêu cầu lấy danh sách flash sale sắp diễn ra");
        List<FlashSaleResponse> responses = flashSaleService.getUpcomingFlashSales();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách flash sale sắp diễn ra thành công", responses));
    }

    @PostMapping("/{flashSaleId}/products")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> addProductToFlashSale(
            @PathVariable Integer flashSaleId,
            @Valid @RequestBody FlashSaleItemRequest request) {
        log.info("Thêm sản phẩm vào flash sale ID {}: {}", flashSaleId, request);
        FlashSaleResponse response = flashSaleService.addProductToFlashSale(flashSaleId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Thêm sản phẩm vào flash sale thành công", response));
    }

    @DeleteMapping("/{flashSaleId}/products/{productId}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> removeProductFromFlashSale(
            @PathVariable Integer flashSaleId,
            @PathVariable Integer productId) {
        log.info("Xóa sản phẩm ID {} khỏi flash sale ID {}", productId, flashSaleId);
        FlashSaleResponse response = flashSaleService.removeProductFromFlashSale(flashSaleId, productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa sản phẩm khỏi flash sale thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> updateFlashSaleStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        log.info("Cập nhật trạng thái flash sale ID {} thành {}", id, status);
        try {
            FlashSaleStatus flashSaleStatus = FlashSaleStatus.valueOf(status.toUpperCase());
            FlashSaleResponse response = flashSaleService.updateFlashSaleStatus(id, flashSaleStatus);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái flash sale thành công", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Trạng thái không hợp lệ: " + status, null));
        }
    }

    @GetMapping("/check-product/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> isProductInActiveFlashSale(@PathVariable Integer productId) {
        log.info("Kiểm tra sản phẩm ID {} có trong flash sale đang hoạt động không", productId);
        boolean result = flashSaleService.isProductInActiveFlashSale(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Kiểm tra sản phẩm trong flash sale thành công", result));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> getActiveFlashSaleForProduct(@PathVariable Integer productId) {
        log.info("Lấy flash sale đang hoạt động cho sản phẩm ID {}", productId);
        FlashSaleResponse response = flashSaleService.getActiveFlashSaleForProduct(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin flash sale cho sản phẩm thành công", response));
    }
}
