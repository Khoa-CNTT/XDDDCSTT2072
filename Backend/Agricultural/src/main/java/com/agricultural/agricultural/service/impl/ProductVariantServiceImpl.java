package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ProductVariantDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductVariant;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.ProductVariantMapper;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductVariantRepository;
import com.agricultural.agricultural.service.IProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements IProductVariantService {
    
    private final IProductVariantRepository productVariantRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final ProductVariantMapper productVariantMapper;

    @Override
    @Transactional
    public ProductVariantDTO createVariant(ProductVariantDTO variantDTO) {
        // Kiểm tra sản phẩm tồn tại
        MarketPlace product = marketPlaceRepository.findById(variantDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + variantDTO.getProductId()));
        
        // Kiểm tra SKU đã tồn tại chưa
        if (variantDTO.getSku() != null && !variantDTO.getSku().isEmpty()) {
            if (productVariantRepository.existsBySku(variantDTO.getSku())) {
                throw new BadRequestException("SKU đã tồn tại: " + variantDTO.getSku());
            }
        }
        
        // Tạo biến thể mới
        ProductVariant variant = productVariantMapper.toEntity(variantDTO);
        variant.setProduct(product);
        
        // Lưu vào database
        ProductVariant savedVariant = productVariantRepository.save(variant);
        return productVariantMapper.toDTO(savedVariant);
    }

    @Override
    @Transactional
    public ProductVariantDTO updateVariant(Integer id, ProductVariantDTO variantDTO) {
        // Tìm biến thể cần cập nhật
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể với ID: " + id));
        
        // Kiểm tra sản phẩm tồn tại nếu thay đổi
        if (variantDTO.getProductId() != null && !variantDTO.getProductId().equals(variant.getProduct().getId())) {
            MarketPlace product = marketPlaceRepository.findById(variantDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + variantDTO.getProductId()));
            variant.setProduct(product);
        }
        
        // Kiểm tra SKU đã tồn tại chưa
        if (variantDTO.getSku() != null && !variantDTO.getSku().isEmpty()) {
            if (!variantDTO.getSku().equals(variant.getSku()) && productVariantRepository.existsBySku(variantDTO.getSku())) {
                throw new BadRequestException("SKU đã tồn tại: " + variantDTO.getSku());
            }
        }
        
        // Cập nhật thông tin
        productVariantMapper.updateVariantFromDTO(variantDTO, variant);
        
        // Lưu vào database
        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return productVariantMapper.toDTO(updatedVariant);
    }

    @Override
    @Transactional
    public void deleteVariant(Integer id) {
        // Kiểm tra biến thể tồn tại
        if (!productVariantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy biến thể với ID: " + id);
        }
        
        // Xóa biến thể
        productVariantRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantDTO getVariant(Integer id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể với ID: " + id));
        
        return productVariantMapper.toDTO(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getAllVariants() {
        List<ProductVariant> variants = productVariantRepository.findAll();
        return productVariantMapper.toDTOList(variants);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getVariantsByProductId(Integer productId) {
        // Kiểm tra sản phẩm tồn tại
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        List<ProductVariant> variants = productVariantRepository.findByProductId(productId);
        return productVariantMapper.toDTOList(variants);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkSkuExists(String sku) {
        if (sku == null || sku.trim().isEmpty()) {
            return false;
        }
        return productVariantRepository.existsBySku(sku);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkSkuExistsExcludingVariant(String sku, Integer variantId) {
        if (sku == null || sku.trim().isEmpty()) {
            return false;
        }
        
        // Kiểm tra biến thể với SKU này và ID khác
        // (Cần bổ sung phương thức repository)
        // Tạm thời triển khai đơn giản
        ProductVariant existingVariant = productVariantRepository.findBySku(sku);
        return existingVariant != null && !existingVariant.getId().equals(variantId);
    }
} 