package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ProductCategoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IProductCategoryService {
    // CRUD cơ bản
    ProductCategoryDTO createCategory(ProductCategoryDTO categoryDTO);
    ProductCategoryDTO updateCategory(Integer id, ProductCategoryDTO categoryDTO);
    void deleteCategory(Integer id);
    ProductCategoryDTO getCategory(Integer id);
    List<ProductCategoryDTO> getAllCategories();
    Page<ProductCategoryDTO> getAllCategoriesPaged(Pageable pageable);
    
    // Chức năng bổ sung
    List<ProductCategoryDTO> getRootCategories();
    List<ProductCategoryDTO> getSubcategories(Integer parentId);
    List<ProductCategoryDTO> getActiveCategories();
    Page<ProductCategoryDTO> searchCategories(String keyword, Pageable pageable);
    
    // Phương thức phức tạp
    List<ProductCategoryDTO> getCategoryTree();
    Long countProductsInCategory(Integer categoryId);
    boolean hasSubcategories(Integer categoryId);
} 