package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.service.IMarketPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("${api.prefix}/marketplace")
@RequiredArgsConstructor
public class MarketPlaceController {
    private final IMarketPlaceService marketPlaceService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MarketPlaceDTO> createProduct(
            @RequestParam("productName") String productName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam("quantity") int quantity,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "salePrice", required = false) BigDecimal salePrice,
            @RequestParam(value = "saleStartDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime saleStartDate,
            @RequestParam(value = "saleEndDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime saleEndDate,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "weight", required = false) Double weight,
            @RequestParam(value = "dimensions", required = false) String dimensions,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        // Gọi service để xử lý tạo sản phẩm với ảnh
        MarketPlaceDTO createdProduct = marketPlaceService.createProductWithImage(
                productName, description, shortDescription, quantity, price, salePrice,
                saleStartDate, saleEndDate, categoryId, sku, weight, dimensions, image);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MarketPlaceDTO> updateProduct(
            @PathVariable Integer id,
            @RequestParam(value = "productName", required = false) String productName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "salePrice", required = false) BigDecimal salePrice,
            @RequestParam(value = "saleStartDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime saleStartDate,
            @RequestParam(value = "saleEndDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime saleEndDate,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "weight", required = false) Double weight,
            @RequestParam(value = "dimensions", required = false) String dimensions,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException, BadRequestException {
        
        // Gọi service để xử lý cập nhật sản phẩm với ảnh
        MarketPlaceDTO updatedProduct = marketPlaceService.updateProductWithImage(
                id, productName, description, shortDescription, quantity, price, salePrice,
                saleStartDate, saleEndDate, categoryId, sku, weight, dimensions, image);
        
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        marketPlaceService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<MarketPlaceDTO> getProduct(@PathVariable Integer id) {
        MarketPlaceDTO product = marketPlaceService.getProduct(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products")
    public ResponseEntity<Page<MarketPlaceDTO>> getAllProducts(Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<MarketPlaceDTO>> searchProducts(@RequestParam String keyword, Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.searchProducts(keyword, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/available")
    public ResponseEntity<Page<MarketPlaceDTO>> getAvailableProducts(Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getAvailableProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<MarketPlaceDTO>> getProductsByCategory(
            @PathVariable Integer categoryId, Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/on-sale")
    public ResponseEntity<Page<MarketPlaceDTO>> getOnSaleProducts(Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getOnSaleProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/price-range")
    public ResponseEntity<Page<MarketPlaceDTO>> getProductsByPriceRange(
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getProductsByPriceRange(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/top-rated")
    public ResponseEntity<Page<MarketPlaceDTO>> getProductsByMinimumRating(
            @RequestParam(required = false, defaultValue = "4.0") BigDecimal minRating, 
            Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getProductsByMinimumRating(minRating, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/popular")
    public ResponseEntity<Page<MarketPlaceDTO>> getPopularProducts(Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getPopularProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/recently-updated")
    public ResponseEntity<Page<MarketPlaceDTO>> getRecentlyUpdatedProducts(Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getRecentlyUpdatedProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<MarketPlaceDTO>> getProductsByUser(
            @PathVariable Integer userId, Pageable pageable) {
        Page<MarketPlaceDTO> products = marketPlaceService.getProductsByUser(userId, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/advanced-search")
    public ResponseEntity<Page<MarketPlaceDTO>> advancedSearch(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "false") boolean onSaleOnly,
            Pageable pageable) {
        
        Page<MarketPlaceDTO> products = marketPlaceService.advancedSearch(
                categoryId, minPrice, maxPrice, keyword, onSaleOnly, pageable);
        
        return ResponseEntity.ok(products);
    }
}
