package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.service.IMarketPlaceService;
import com.agricultural.agricultural.service.impl.MarketPlaceServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/marketplace")
@RequiredArgsConstructor
public class MarketPlaceController {
    private final MarketPlaceServiceImpl marketPlaceService;

    @PostMapping("/create")
    public ResponseEntity<MarketPlaceDTO> createProduct(@RequestBody MarketPlaceDTO productDTO) {
        MarketPlaceDTO createdProduct = marketPlaceService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MarketPlaceDTO> updateProduct(@PathVariable Integer id, @RequestBody MarketPlaceDTO productDTO) throws BadRequestException {
        MarketPlaceDTO updatedProduct = marketPlaceService.updateProduct(id, productDTO);
        if (updatedProduct != null) {
            return ResponseEntity.ok(updatedProduct);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
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

}
