package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ProductCategoryDTO;
import com.agricultural.agricultural.service.ICloudinaryService;
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
    private final ICloudinaryService cloudinaryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductCategoryDTO> createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "parentId", required = false) Integer parentId,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        ProductCategoryDTO categoryDTO = ProductCategoryDTO.builder()
                .name(name)
                .description(description)
                .parentId(parentId)
                .isActive(isActive == null ? true : isActive)
                .displayOrder(displayOrder)
                .build();

        // Xử lý upload ảnh nếu có
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image, "product-categories");
            categoryDTO.setImageUrl(imageUrl);
        }

        ProductCategoryDTO createdCategory = productCategoryService.createCategory(categoryDTO);
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

        // Lấy thông tin danh mục hiện tại để giữ các giá trị không thay đổi
        ProductCategoryDTO existingCategory = productCategoryService.getCategory(id);

        ProductCategoryDTO categoryDTO = ProductCategoryDTO.builder()
                .id(id)
                .name(name != null ? name : existingCategory.getName())
                .description(description != null ? description : existingCategory.getDescription())
                .parentId(parentId != null ? parentId : existingCategory.getParentId())
                .isActive(isActive != null ? isActive : existingCategory.getIsActive())
                .displayOrder(displayOrder != null ? displayOrder : existingCategory.getDisplayOrder())
                .imageUrl(existingCategory.getImageUrl()) // Giữ lại URL ảnh hiện tại
                .build();

        // Xử lý upload ảnh mới nếu có
        if (image != null && !image.isEmpty()) {
            // Xóa ảnh cũ nếu có
            if (existingCategory.getImageUrl() != null && !existingCategory.getImageUrl().isEmpty()) {
                try {
                    String publicId = cloudinaryService.extractPublicIdFromUrl(existingCategory.getImageUrl());
                    cloudinaryService.deleteImage(publicId);
                } catch (Exception e) {
                    // Bỏ qua lỗi khi xóa ảnh cũ
                }
            }

            // Upload ảnh mới
            String imageUrl = cloudinaryService.uploadImage(image, "product-categories");
            categoryDTO.setImageUrl(imageUrl);
        }

        ProductCategoryDTO updatedCategory = productCategoryService.updateCategory(id, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        // Lấy thông tin danh mục để xóa ảnh
        ProductCategoryDTO category = productCategoryService.getCategory(id);

        // Xóa danh mục
        productCategoryService.deleteCategory(id);

        // Xóa ảnh từ Cloudinary nếu có
        if (category.getImageUrl() != null && !category.getImageUrl().isEmpty()) {
            try {
                String publicId = cloudinaryService.extractPublicIdFromUrl(category.getImageUrl());
                cloudinaryService.deleteImage(publicId);
            } catch (Exception e) {
                // Bỏ qua lỗi khi xóa ảnh
            }
        }

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