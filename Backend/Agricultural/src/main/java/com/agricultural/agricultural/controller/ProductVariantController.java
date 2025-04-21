package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ProductVariantDTO;
import com.agricultural.agricultural.service.IProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {
    
    private final IProductVariantService productVariantService;
    
    @PostMapping
    public ResponseEntity<ProductVariantDTO> createVariant(@Valid @RequestBody ProductVariantDTO variantDTO) {
        ProductVariantDTO createdVariant = productVariantService.createVariant(variantDTO);
        return new ResponseEntity<>(createdVariant, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantDTO> updateVariant(
            @PathVariable Integer id, 
            @Valid @RequestBody ProductVariantDTO variantDTO) {
        ProductVariantDTO updatedVariant = productVariantService.updateVariant(id, variantDTO);
        return ResponseEntity.ok(updatedVariant);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Integer id) {
        productVariantService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantDTO> getVariant(@PathVariable Integer id) {
        ProductVariantDTO variant = productVariantService.getVariant(id);
        return ResponseEntity.ok(variant);
    }
    
    @GetMapping
    public ResponseEntity<List<ProductVariantDTO>> getAllVariants() {
        List<ProductVariantDTO> variants = productVariantService.getAllVariants();
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariantDTO>> getVariantsByProductId(@PathVariable Integer productId) {
        List<ProductVariantDTO> variants = productVariantService.getVariantsByProductId(productId);
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/check-sku")
    public ResponseEntity<Boolean> checkSkuExists(@RequestParam String sku) {
        boolean exists = productVariantService.checkSkuExists(sku);
        return ResponseEntity.ok(exists);
    }
    
    @GetMapping("/check-sku/{variantId}")
    public ResponseEntity<Boolean> checkSkuExistsExcludingVariant(
            @RequestParam String sku,
            @PathVariable Integer variantId) {
        boolean exists = productVariantService.checkSkuExistsExcludingVariant(sku, variantId);
        return ResponseEntity.ok(exists);
    }
} 