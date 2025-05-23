package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ProductImageDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductImage;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.ProductImageMapper;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductImageRepository;
import com.agricultural.agricultural.service.IProductImageService;
import com.agricultural.agricultural.service.ICloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements IProductImageService {
    
    private final IProductImageRepository productImageRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final ProductImageMapper productImageMapper;
    private final ICloudinaryService cloudinaryService;
    
    private static final String PRODUCT_IMAGE_PATH = "product-images";
    
    private static final Logger log = LoggerFactory.getLogger(ProductImageServiceImpl.class);
    
    @Override
    public List<ProductImageDTO> getAllImagesByProduct(Integer productId) {
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        return productImageMapper.toDTOList(images);
    }
    
    @Override
    public ProductImageDTO getPrimaryImage(Integer productId) {
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        ProductImage primaryImage = productImageRepository.findByProductIdAndIsPrimaryTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh chính cho sản phẩm với ID: " + productId));
        
        return productImageMapper.toDTO(primaryImage);
    }
    
    @Override
    @Transactional
    public ProductImageDTO addImageToProduct(Integer productId, ProductImageDTO imageDTO) {
        MarketPlace product = marketPlaceRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        ProductImage productImage = productImageMapper.toEntity(imageDTO);
        productImage.setProduct(product);
        
        if (productImage.isPrimary()) {
            productImageRepository.unsetPrimaryForAllProductImages(productId);
        }
        
        if (productImage.getDisplayOrder() == null || productImage.getDisplayOrder() == 0) {
            Integer maxOrder = productImageRepository.findMaxDisplayOrderByProductId(productId);
            productImage.setDisplayOrder(maxOrder != null ? maxOrder + 1 : 1);
        }
        
        ProductImage savedImage = productImageRepository.save(productImage);
        
        if (savedImage.isPrimary()) {
            product.setImageUrl(savedImage.getImageUrl());
            marketPlaceRepository.save(product);
        }
        
        return productImageMapper.toDTO(savedImage);
    }
    
    @Override
    @Transactional
    public ProductImageDTO uploadImageToProduct(Integer productId, MultipartFile file, 
                                             String altText, String title, Boolean isPrimary) throws IOException {
        MarketPlace product = marketPlaceRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        if (file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }
        
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        
        String fileUrl = cloudinaryService.uploadImage(file, PRODUCT_IMAGE_PATH + "/" + productId, fileName);
        
        ProductImageDTO imageDTO = ProductImageDTO.builder()
                .imageUrl(fileUrl)
                .altText(altText)
                .title(title)
                .isPrimary(isPrimary != null && isPrimary)
                .build();
        
        return addImageToProduct(productId, imageDTO);
    }
    
    @Override
    @Transactional
    public List<ProductImageDTO> uploadImagesToProduct(Integer productId, List<MultipartFile> files) throws IOException {
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("Danh sách file không được để trống");
        }
        
        List<ProductImageDTO> uploadedImages = new ArrayList<>();
        
        Integer maxOrder = productImageRepository.findMaxDisplayOrderByProductId(productId);
        int startOrder = maxOrder != null ? maxOrder + 1 : 1;
        
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            
            if (file.isEmpty()) {
                continue;
            }
            
            boolean isPrimary = (i == 0) && (productImageRepository.countByProductId(productId) == 0);
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            
            String fileUrl = cloudinaryService.uploadImage(file, PRODUCT_IMAGE_PATH + "/" + productId, fileName);
            
            ProductImageDTO imageDTO = ProductImageDTO.builder()
                    .imageUrl(fileUrl)
                    .altText(fileName)
                    .title(fileName)
                    .isPrimary(isPrimary)
                    .displayOrder(startOrder + i)
                    .build();
            
            ProductImageDTO uploadedImage = addImageToProduct(productId, imageDTO);
            uploadedImages.add(uploadedImage);
        }
        
        return uploadedImages;
    }
    
    @Override
    @Transactional
    public ProductImageDTO updateImage(Integer imageId, ProductImageDTO imageDTO) {
        // Tìm ảnh
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với ID: " + imageId));
        
        log.info("Cập nhật ảnh ID: {} cho sản phẩm ID: {}", imageId, productImage.getProduct().getId());
        log.info("Thông tin trước khi cập nhật: imageUrl={}, isPrimary={}", 
                productImage.getImageUrl(), productImage.isPrimary());
        log.info("Thông tin cập nhật mới: imageUrl={}, isPrimary={}", 
                imageDTO.getImageUrl(), imageDTO.isPrimary());
        
        // Cập nhật thông tin
        productImageMapper.updateEntityFromDTO(imageDTO, productImage);
        
        if (imageDTO.isPrimary() && !productImage.isPrimary()) {
            log.info("Đặt ảnh ID {} làm ảnh chính cho sản phẩm ID: {}", 
                    imageId, productImage.getProduct().getId());
            
            productImageRepository.unsetPrimaryForAllProductImages(productImage.getProduct().getId());
            productImage.setIsPrimary(true);
            
            MarketPlace product = productImage.getProduct();
            
            String imageUrl = productImage.getImageUrl();
            if (imageUrl != null && !imageUrl.isEmpty()) {
                if (imageUrl.contains("?")) {
                    imageUrl = imageUrl + "&t=" + System.currentTimeMillis();
                } else {
                    imageUrl = imageUrl + "?t=" + System.currentTimeMillis();
                }
                log.info("Đã thêm timestamp vào URL ảnh: {}", imageUrl);
            }
            
            product.setImageUrl(imageUrl);
            marketPlaceRepository.save(product);
            log.info("Đã cập nhật ảnh chính cho sản phẩm ID: {}", product.getId());
        }
        
        ProductImage updatedImage = productImageRepository.save(productImage);
        log.info("Lưu ảnh thành công, ID: {}", updatedImage.getId());
        
        return productImageMapper.toDTO(updatedImage);
    }
    
    @Override
    @Transactional
    public ProductImageDTO setPrimaryImage(Integer imageId) {
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với ID: " + imageId));
        
        if (productImage.isPrimary()) {
            return productImageMapper.toDTO(productImage);
        }
        
        productImageRepository.unsetPrimaryForAllProductImages(productImage.getProduct().getId());
        
        productImage.setIsPrimary(true);
        
        MarketPlace product = productImage.getProduct();
        product.setImageUrl(productImage.getImageUrl());
        marketPlaceRepository.save(product);
        
        ProductImage updatedImage = productImageRepository.save(productImage);
        return productImageMapper.toDTO(updatedImage);
    }
    
    @Override
    @Transactional
    public List<ProductImageDTO> reorderImages(Integer productId, List<Integer> imageIds) {
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        if (imageIds == null || imageIds.isEmpty()) {
            throw new BadRequestException("Danh sách ID ảnh không được để trống");
        }
        
        List<ProductImage> currentImages = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        
        // Kiểm tra số lượng ảnh
        if (currentImages.size() != imageIds.size()) {
            throw new BadRequestException("Số lượng ảnh không khớp");
        }
        
        IntStream.range(0, imageIds.size()).forEach(i -> {
            Integer imageId = imageIds.get(i);
            ProductImage image = productImageRepository.findById(imageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với ID: " + imageId));
            
            // Kiểm tra ảnh có thuộc sản phẩm không
            if (!image.getProduct().getId().equals(productId)) {
                throw new BadRequestException("Ảnh không thuộc sản phẩm");
            }
            
            image.setDisplayOrder(i + 1);
            productImageRepository.save(image);
        });
        
        List<ProductImage> updatedImages = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        return productImageMapper.toDTOList(updatedImages);
    }
    
    @Override
    @Transactional
    public void deleteImage(Integer imageId) {
        // Tìm ảnh
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với ID: " + imageId));
        
        boolean isPrimary = productImage.isPrimary();
        Integer productId = productImage.getProduct().getId();
        
        try {
            String publicId = cloudinaryService.extractPublicIdFromUrl(productImage.getImageUrl());
            if (publicId != null) {
                cloudinaryService.deleteImage(publicId);
            }
        } catch (Exception e) {
        }
        
        productImageRepository.deleteById(imageId);
    }
    
    @Override
    @Transactional
    public void deleteAllImagesOfProduct(Integer productId) {
        MarketPlace product = marketPlaceRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        
        for (ProductImage image : images) {
            try {
                String publicId = cloudinaryService.extractPublicIdFromUrl(image.getImageUrl());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            } catch (Exception e) {
            }
        }
        
        productImageRepository.deleteByProductId(productId);
        
        product.setImageUrl(null);
        marketPlaceRepository.save(product);
    }
} 