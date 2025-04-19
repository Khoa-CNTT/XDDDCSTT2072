package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ProductCategoryDTO;
import com.agricultural.agricultural.service.IProductCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {
    
    private final IProductCategoryService productCategoryService;
    
    @PostMapping
    public ResponseEntity<ProductCategoryDTO> createCategory(@Valid @RequestBody ProductCategoryDTO categoryDTO) {
        ProductCategoryDTO createdCategory = productCategoryService.createCategory(categoryDTO);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductCategoryDTO> updateCategory(
            @PathVariable Integer id, 
            @Valid @RequestBody ProductCategoryDTO categoryDTO) {
        ProductCategoryDTO updatedCategory = productCategoryService.updateCategory(id, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        productCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductCategoryDTO> getCategory(@PathVariable Integer id) {
        ProductCategoryDTO category = productCategoryService.getCategory(id);
        return ResponseEntity.ok(category);
    }
    
    @GetMapping
    public ResponseEntity<List<ProductCategoryDTO>> getAllCategories() {
        List<ProductCategoryDTO> categories = productCategoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/paged")
    public ResponseEntity<Page<ProductCategoryDTO>> getAllCategoriesPaged(Pageable pageable) {
        Page<ProductCategoryDTO> categories = productCategoryService.getAllCategoriesPaged(pageable);
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/root")
    public ResponseEntity<List<ProductCategoryDTO>> getRootCategories() {
        List<ProductCategoryDTO> rootCategories = productCategoryService.getRootCategories();
        return ResponseEntity.ok(rootCategories);
    }
    
    @GetMapping("/subcategories/{parentId}")
    public ResponseEntity<List<ProductCategoryDTO>> getSubcategories(@PathVariable Integer parentId) {
        List<ProductCategoryDTO> subcategories = productCategoryService.getSubcategories(parentId);
        return ResponseEntity.ok(subcategories);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<ProductCategoryDTO>> getActiveCategories() {
        List<ProductCategoryDTO> activeCategories = productCategoryService.getActiveCategories();
        return ResponseEntity.ok(activeCategories);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ProductCategoryDTO>> searchCategories(
            @RequestParam String keyword,
            Pageable pageable) {
        Page<ProductCategoryDTO> searchResults = productCategoryService.searchCategories(keyword, pageable);
        return ResponseEntity.ok(searchResults);
    }
    
    @GetMapping("/tree")
    public ResponseEntity<List<ProductCategoryDTO>> getCategoryTree() {
        List<ProductCategoryDTO> categoryTree = productCategoryService.getCategoryTree();
        return ResponseEntity.ok(categoryTree);
    }
    
    @GetMapping("/{id}/count-products")
    public ResponseEntity<Long> countProductsInCategory(@PathVariable Integer id) {
        Long productCount = productCategoryService.countProductsInCategory(id);
        return ResponseEntity.ok(productCount);
    }
    
    @GetMapping("/{id}/has-subcategories")
    public ResponseEntity<Boolean> hasSubcategories(@PathVariable Integer id) {
        boolean hasSubcategories = productCategoryService.hasSubcategories(id);
        return ResponseEntity.ok(hasSubcategories);
    }
} 