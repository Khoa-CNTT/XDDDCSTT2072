package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ProductCategoryDTO;
import com.agricultural.agricultural.service.IProductCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {
    
    private final IProductCategoryService productCategoryService;
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductCategoryDTO> createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "parentId", required = false) Integer parentId,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        // Gọi service để xử lý tạo danh mục với ảnh
        ProductCategoryDTO createdCategory = productCategoryService.createCategoryWithImage(
                name, description, parentId, isActive, displayOrder, image);
        
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductCategoryDTO> updateCategory(
            @PathVariable Integer id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "parentId", required = false) Integer parentId,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        // Gọi service để xử lý cập nhật danh mục với ảnh
        ProductCategoryDTO updatedCategory = productCategoryService.updateCategoryWithImage(
                id, name, description, parentId, isActive, displayOrder, image);
        
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