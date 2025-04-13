package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ProductCategoryDTO;
import com.agricultural.agricultural.entity.ProductCategory;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.ProductCategoryMapper;
import com.agricultural.agricultural.repository.IProductCategoryRepository;
import com.agricultural.agricultural.service.IProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements IProductCategoryService {
    
    private final IProductCategoryRepository productCategoryRepository;
    private final ProductCategoryMapper productCategoryMapper;

    @Override
    @Transactional
    public ProductCategoryDTO createCategory(ProductCategoryDTO categoryDTO) {
        // Kiểm tra tên danh mục đã tồn tại chưa
        if (productCategoryRepository.existsByNameIgnoreCase(categoryDTO.getName())) {
            throw new BadRequestException("Tên danh mục đã tồn tại");
        }
        
        // Xử lý danh mục cha nếu có
        ProductCategory category = productCategoryMapper.toEntity(categoryDTO);
        if (categoryDTO.getParentId() != null) {
            ProductCategory parent = productCategoryRepository.findById(categoryDTO.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha với ID: " + categoryDTO.getParentId()));
            category.setParent(parent);
        }
        
        // Lưu vào database
        ProductCategory savedCategory = productCategoryRepository.save(category);
        return productCategoryMapper.toDTO(savedCategory);
    }

    @Override
    @Transactional
    public ProductCategoryDTO updateCategory(Integer id, ProductCategoryDTO categoryDTO) {
        // Tìm danh mục cần cập nhật
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
        
        // Kiểm tra nếu tên thay đổi và đã tồn tại
        if (!category.getName().equalsIgnoreCase(categoryDTO.getName()) && 
            productCategoryRepository.existsByNameIgnoreCase(categoryDTO.getName())) {
            throw new BadRequestException("Tên danh mục đã tồn tại");
        }
        
        // Cập nhật thông tin cơ bản
        productCategoryMapper.updateCategoryFromDTO(categoryDTO, category);
        
        // Cập nhật danh mục cha nếu có
        if (categoryDTO.getParentId() != null) {
            // Kiểm tra không thể đặt chính nó làm cha
            if (categoryDTO.getParentId().equals(id)) {
                throw new BadRequestException("Không thể đặt danh mục làm cha của chính nó");
            }
            
            // Kiểm tra không thể đặt con của nó làm cha
            if (isChildCategory(id, categoryDTO.getParentId())) {
                throw new BadRequestException("Không thể đặt danh mục con làm cha");
            }
            
            ProductCategory parent = productCategoryRepository.findById(categoryDTO.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha với ID: " + categoryDTO.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        
        // Lưu vào database
        ProductCategory updatedCategory = productCategoryRepository.save(category);
        return productCategoryMapper.toDTO(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        // Kiểm tra danh mục tồn tại
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
        
        // Kiểm tra có sản phẩm trong danh mục không
        long productCount = productCategoryRepository.countProductsByCategoryId(id);
        if (productCount > 0) {
            throw new BadRequestException("Không thể xóa danh mục có sản phẩm. Vui lòng xóa sản phẩm trước.");
        }
        
        // Kiểm tra có danh mục con không
        boolean hasChildren = productCategoryRepository.existsByParentId(id);
        if (hasChildren) {
            throw new BadRequestException("Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.");
        }
        
        // Xóa danh mục
        productCategoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductCategoryDTO getCategory(Integer id) {
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
        
        ProductCategoryDTO dto = productCategoryMapper.toDTO(category);
        
        // Bổ sung thông tin số sản phẩm
        dto.setProductCount(productCategoryRepository.countProductsByCategoryId(id));
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryDTO> getAllCategories() {
        List<ProductCategory> categories = productCategoryRepository.findAll();
        return productCategoryMapper.toDTOList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductCategoryDTO> getAllCategoriesPaged(Pageable pageable) {
        return productCategoryRepository.findAll(pageable)
                .map(productCategoryMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryDTO> getRootCategories() {
        List<ProductCategory> rootCategories = productCategoryRepository.findByParentIsNull();
        return productCategoryMapper.toDTOList(rootCategories);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryDTO> getSubcategories(Integer parentId) {
        // Kiểm tra danh mục cha tồn tại
        if (!productCategoryRepository.existsById(parentId)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục cha với ID: " + parentId);
        }
        
        List<ProductCategory> subcategories = productCategoryRepository.findByParentId(parentId);
        return productCategoryMapper.toDTOList(subcategories);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryDTO> getActiveCategories() {
        List<ProductCategory> activeCategories = productCategoryRepository.findByIsActive(true);
        return productCategoryMapper.toDTOList(activeCategories);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductCategoryDTO> searchCategories(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Từ khóa tìm kiếm không được để trống");
        }
        
        return productCategoryRepository.findByNameContainingIgnoreCase(keyword, pageable)
                .map(productCategoryMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryDTO> getCategoryTree() {
        // Lấy tất cả danh mục gốc (không có cha)
        List<ProductCategory> rootCategories = productCategoryRepository.findByParentIsNull();
        
        // Chuyển đổi danh sách và xây dựng cây đệ quy
        return rootCategories.stream()
                .map(this::buildCategoryTree)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long countProductsInCategory(Integer categoryId) {
        // Kiểm tra danh mục tồn tại
        if (!productCategoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + categoryId);
        }
        
        return productCategoryRepository.countProductsByCategoryId(categoryId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasSubcategories(Integer categoryId) {
        // Kiểm tra danh mục tồn tại
        if (!productCategoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + categoryId);
        }
        
        return productCategoryRepository.existsByParentId(categoryId);
    }
    
    // Phương thức hỗ trợ xây dựng cây danh mục
    private ProductCategoryDTO buildCategoryTree(ProductCategory category) {
        ProductCategoryDTO dto = productCategoryMapper.toDTO(category);
        
        // Thêm số lượng sản phẩm
        dto.setProductCount(productCategoryRepository.countProductsByCategoryId(category.getId()));
        
        // Đệ quy để thêm danh mục con
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            List<ProductCategoryDTO> childrenDTO = new ArrayList<>();
            for (ProductCategory child : category.getChildren()) {
                childrenDTO.add(buildCategoryTree(child));
            }
            dto.setChildren(childrenDTO);
        }
        
        return dto;
    }
    
    // Kiểm tra nếu một danh mục là con của danh mục khác
    private boolean isChildCategory(Integer parentId, Integer potentialChildId) {
        if (parentId.equals(potentialChildId)) {
            return true;
        }
        
        List<ProductCategory> children = productCategoryRepository.findByParentId(parentId);
        for (ProductCategory child : children) {
            if (isChildCategory(child.getId(), potentialChildId)) {
                return true;
            }
        }
        
        return false;
    }
} 