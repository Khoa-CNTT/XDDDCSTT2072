package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/marketplace")
@RequiredArgsConstructor
public class MarketPlaceController {
    private final IMarketPlaceService marketPlaceService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MarketPlaceDTO> createProduct(
            @ModelAttribute MarketPlaceDTO productDTO) throws IOException {
        
        System.out.println("\n===== REQUEST DATA CHO CREATE PRODUCT =====");
        System.out.println("Product Name: " + productDTO.getProductName());
        System.out.println("Description: " + productDTO.getDescription());
        System.out.println("Price: " + productDTO.getPrice());
        System.out.println("Quantity: " + productDTO.getQuantity());
        System.out.println("Category ID: " + productDTO.getCategoryId());
        System.out.println("Image File: " + (productDTO.getImageFile() != null ? 
                           productDTO.getImageFile().getOriginalFilename() : "null"));
        
        // Validate dữ liệu đầu vào
        if (productDTO.getProductName() == null || productDTO.getProductName().trim().isEmpty()) {
            throw new BadRequestException("Tên sản phẩm không được để trống");
        }
        
        if (productDTO.getPrice() == null || productDTO.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá sản phẩm phải lớn hơn 0");
        }
        
        // Gọi service để xử lý tạo sản phẩm với ảnh
        MarketPlaceDTO createdProduct = marketPlaceService.createProductWithImage(
                productDTO.getProductName(), 
                productDTO.getDescription(), 
                productDTO.getShortDescription(), 
                productDTO.getQuantity(), 
                productDTO.getPrice(), 
                productDTO.getSalePrice(),
                productDTO.getSaleStartDate(), 
                productDTO.getSaleEndDate(), 
                productDTO.getCategoryId(), 
                productDTO.getSku(), 
                productDTO.getWeight(), 
                productDTO.getDimensions(), 
                productDTO.getImageFile());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
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
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            Pageable pageable) {
        
        System.out.println("\n===== ADVANCED SEARCH REQUEST =====");
        System.out.println("categoryId: " + categoryId);
        System.out.println("keyword: " + keyword);
        System.out.println("onSaleOnly: " + onSaleOnly);
        System.out.println("sortBy: " + sortBy);
        
        Page<MarketPlaceDTO> products = marketPlaceService.advancedSearch(
                categoryId, minPrice, maxPrice, keyword, onSaleOnly, sortBy, pageable);
        
        return ResponseEntity.ok(products);
    }

    @PostMapping("/product/{id}")
    public ResponseEntity<?> updateProductWithImage(
            @PathVariable Integer id,
            @ModelAttribute MarketPlaceDTO productDTO) {
        try {
            // Log dữ liệu nhận được
            System.out.println("\n===== REQUEST DATA CHO UPDATE PRODUCT WITH IMAGE =====");
            System.out.println("ID: " + id);
            System.out.println("Product Name: " + productDTO.getProductName());
            System.out.println("Quantity: " + productDTO.getQuantity());
            System.out.println("salePrice raw: " + productDTO.getSalePrice());
            System.out.println("saleStartDate raw: " + productDTO.getSaleStartDate());
            System.out.println("saleEndDate raw: " + productDTO.getSaleEndDate());
            System.out.println("Image File: " + (productDTO.getImageFile() != null ? 
                                productDTO.getImageFile().getOriginalFilename() : "null"));
            
            // Gọi service, tất cả xử lý dữ liệu nằm trong service
            MarketPlaceDTO updatedProduct = marketPlaceService.updateProductWithImage(id, productDTO);
            return ResponseEntity.ok(updatedProduct);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi cập nhật sản phẩm với ảnh: " + ex.getMessage());
        }
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @RequestBody MarketPlaceDTO productDTO) {
        try {
            // Log dữ liệu nhận được
            System.out.println("\n===== REQUEST DATA CHO UPDATE PRODUCT =====");
            System.out.println("ID: " + id);
            System.out.println("Product Name: " + productDTO.getProductName());
            System.out.println("salePrice: " + productDTO.getSalePrice());
            System.out.println("saleStartDate: " + productDTO.getSaleStartDate());
            System.out.println("saleEndDate: " + productDTO.getSaleEndDate());
            
            // Gọi service, tất cả xử lý dữ liệu nằm trong service
            MarketPlaceDTO updatedProduct = marketPlaceService.updateProduct(id, productDTO);
            return ResponseEntity.ok(updatedProduct);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi cập nhật sản phẩm: " + ex.getMessage());
        }
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProductLegacy(
            @PathVariable Integer id,
            @ModelAttribute MarketPlaceDTO productDTO) {
        try {
            // Log dữ liệu nhận được
            System.out.println("\n===== REQUEST DATA CHO UPDATE PRODUCT (LEGACY) =====");
            System.out.println("ID: " + id);
            System.out.println("Product Name: " + productDTO.getProductName());
            System.out.println("salePrice: " + productDTO.getSalePrice());
            System.out.println("saleStartDate: " + productDTO.getSaleStartDate());
            System.out.println("saleEndDate: " + productDTO.getSaleEndDate());
            System.out.println("Image File: " + (productDTO.getImageFile() != null ? 
                                productDTO.getImageFile().getOriginalFilename() : "null"));
            
            // Gọi service, tất cả xử lý dữ liệu nằm trong service
            MarketPlaceDTO updatedProduct = marketPlaceService.updateProductWithImage(id, productDTO);
            return ResponseEntity.ok(updatedProduct);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (BadRequestException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi cập nhật sản phẩm: " + ex.getMessage());
        }
    }

    @PostMapping("/admin/refresh-stock-status")
    public ResponseEntity<?> refreshStockStatus() {
        try {
            System.out.println("\n===== YÊU CẦU LÀM MỚI TRẠNG THÁI HÀNG VÀ THÔNG TIN GIẢM GIÁ =====");
            List<MarketPlaceDTO> updatedProducts = marketPlaceService.refreshAllStockStatus();
            
            return ResponseEntity.ok(
                Map.of(
                    "success", true,
                    "message", "Đã làm mới trạng thái cho " + updatedProducts.size() + " sản phẩm",
                    "products", updatedProducts
                )
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Lỗi khi làm mới trạng thái: " + ex.getMessage()
                ));
        }
    }

    @PostMapping("/admin/refresh-products")
    public ResponseEntity<?> refreshProductsData() {
        try {
            System.out.println("===== NHẬN YÊU CẦU LÀM MỚI DỮ LIỆU SẢN PHẨM =====");
            List<MarketPlaceDTO> refreshedProducts = marketPlaceService.refreshAllProducts();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Đã làm mới dữ liệu của " + refreshedProducts.size() + " sản phẩm",
                "products", refreshedProducts
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "error",
                    "message", "Lỗi khi làm mới dữ liệu sản phẩm: " + e.getMessage()
                ));
        }
    }
}
