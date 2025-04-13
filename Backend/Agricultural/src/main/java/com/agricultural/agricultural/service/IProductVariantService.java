package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ProductVariantDTO;

import java.util.List;

public interface IProductVariantService {
    // CRUD cơ bản
    ProductVariantDTO createVariant(ProductVariantDTO variantDTO);
    ProductVariantDTO updateVariant(Integer id, ProductVariantDTO variantDTO);
    void deleteVariant(Integer id);
    ProductVariantDTO getVariant(Integer id);
    List<ProductVariantDTO> getAllVariants();
    
    // Chức năng bổ sung
    List<ProductVariantDTO> getVariantsByProductId(Integer productId);
    boolean checkSkuExists(String sku);
    boolean checkSkuExistsExcludingVariant(String sku, Integer variantId);
} 