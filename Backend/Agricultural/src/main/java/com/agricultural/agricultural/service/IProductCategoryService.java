package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ProductCategoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    
    /**
     * Tạo danh mục mới với hình ảnh sử dụng form-data
     * 
     * @param name Tên danh mục
     * @param description Mô tả danh mục
     * @param parentId ID danh mục cha
     * @param isActive Trạng thái hoạt động
     * @param displayOrder Thứ tự hiển thị
     * @param image File ảnh
     * @return Danh mục đã tạo
     * @throws IOException Nếu có lỗi khi xử lý ảnh
     */
    ProductCategoryDTO createCategoryWithImage(
            String name,
            String description,
            Integer parentId,
            Boolean isActive,
            Integer displayOrder,
            MultipartFile image) throws IOException;
    
    /**
     * Cập nhật danh mục với hình ảnh sử dụng form-data
     * 
     * @param id ID danh mục cần cập nhật
     * @param name Tên danh mục
     * @param description Mô tả danh mục
     * @param parentId ID danh mục cha
     * @param isActive Trạng thái hoạt động
     * @param displayOrder Thứ tự hiển thị
     * @param image File ảnh mới
     * @return Danh mục đã cập nhật
     * @throws IOException Nếu có lỗi khi xử lý ảnh
     */
    ProductCategoryDTO updateCategoryWithImage(
            Integer id,
            String name,
            String description,
            Integer parentId,
            Boolean isActive,
            Integer displayOrder,
            MultipartFile image) throws IOException;
} 