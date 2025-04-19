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

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements IProductImageService {
    
    private final IProductImageRepository productImageRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final ProductImageMapper productImageMapper;
    private final ICloudinaryService cloudinaryService;
    
    private static final String PRODUCT_IMAGE_PATH = "product-images";
    
    @Override
    public List<ProductImageDTO> getAllImagesByProduct(Integer productId) {
        // Kiểm tra tồn tại sản phẩm
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        return productImageMapper.toDTOList(images);
    }
    
    @Override
    public ProductImageDTO getPrimaryImage(Integer productId) {
        // Kiểm tra tồn tại sản phẩm
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
        // Tìm sản phẩm
        MarketPlace product = marketPlaceRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        // Chuyển đổi DTO thành entity
        ProductImage productImage = productImageMapper.toEntity(imageDTO);
        productImage.setProduct(product);
        
        // Nếu là ảnh chính, đặt các ảnh khác không phải là ảnh chính
        if (productImage.isPrimary()) {
            productImageRepository.unsetPrimaryForAllProductImages(productId);
        }
        
        // Thiết lập thứ tự hiển thị nếu chưa có
        if (productImage.getDisplayOrder() == null || productImage.getDisplayOrder() == 0) {
            Integer maxOrder = productImageRepository.findMaxDisplayOrderByProductId(productId);
            productImage.setDisplayOrder(maxOrder != null ? maxOrder + 1 : 1);
        }
        
        // Lưu ảnh vào cơ sở dữ liệu
        ProductImage savedImage = productImageRepository.save(productImage);
        
        // Cập nhật ảnh chính cho sản phẩm nếu đây là ảnh chính
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
        // Tìm sản phẩm
        MarketPlace product = marketPlaceRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        // Kiểm tra file
        if (file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }
        
        // Tạo tên file
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        
        // Lưu file lên Cloudinary
        String fileUrl = cloudinaryService.uploadImage(file, PRODUCT_IMAGE_PATH + "/" + productId, fileName);
        
        // Tạo đối tượng ProductImageDTO
        ProductImageDTO imageDTO = ProductImageDTO.builder()
                .imageUrl(fileUrl)
                .altText(altText)
                .title(title)
                .isPrimary(isPrimary != null && isPrimary)
                .build();
        
        // Thêm ảnh cho sản phẩm
        return addImageToProduct(productId, imageDTO);
    }
    
    @Override
    @Transactional
    public List<ProductImageDTO> uploadImagesToProduct(Integer productId, List<MultipartFile> files) throws IOException {
        // Kiểm tra tồn tại sản phẩm
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        // Kiểm tra danh sách file
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("Danh sách file không được để trống");
        }
        
        List<ProductImageDTO> uploadedImages = new ArrayList<>();
        
        // Lấy thứ tự hiển thị cuối cùng
        Integer maxOrder = productImageRepository.findMaxDisplayOrderByProductId(productId);
        int startOrder = maxOrder != null ? maxOrder + 1 : 1;
        
        // Upload từng file
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            
            // Bỏ qua file rỗng
            if (file.isEmpty()) {
                continue;
            }
            
            // Thiết lập ảnh đầu tiên làm ảnh chính nếu chưa có ảnh nào
            boolean isPrimary = (i == 0) && (productImageRepository.countByProductId(productId) == 0);
            
            // Tạo tên file
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            
            // Lưu file lên Cloudinary
            String fileUrl = cloudinaryService.uploadImage(file, PRODUCT_IMAGE_PATH + "/" + productId, fileName);
            
            // Tạo đối tượng ProductImageDTO
            ProductImageDTO imageDTO = ProductImageDTO.builder()
                    .imageUrl(fileUrl)
                    .altText(fileName)
                    .title(fileName)
                    .isPrimary(isPrimary)
                    .displayOrder(startOrder + i)
                    .build();
            
            // Thêm ảnh cho sản phẩm
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
        
        // Cập nhật thông tin
        productImageMapper.updateEntityFromDTO(imageDTO, productImage);
        
        // Nếu đang cập nhật thành ảnh chính
        if (imageDTO.isPrimary() && !productImage.isPrimary()) {
            productImageRepository.unsetPrimaryForAllProductImages(productImage.getProduct().getId());
            productImage.setIsPrimary(true);
            
            // Cập nhật ảnh chính cho sản phẩm
            MarketPlace product = productImage.getProduct();
            product.setImageUrl(productImage.getImageUrl());
            marketPlaceRepository.save(product);
        }
        
        ProductImage updatedImage = productImageRepository.save(productImage);
        return productImageMapper.toDTO(updatedImage);
    }
    
    @Override
    @Transactional
    public ProductImageDTO setPrimaryImage(Integer imageId) {
        // Tìm ảnh
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với ID: " + imageId));
        
        // Đã là ảnh chính rồi thì không làm gì
        if (productImage.isPrimary()) {
            return productImageMapper.toDTO(productImage);
        }
        
        // Đặt các ảnh khác không phải là ảnh chính
        productImageRepository.unsetPrimaryForAllProductImages(productImage.getProduct().getId());
        
        // Đặt ảnh hiện tại là ảnh chính
        productImage.setIsPrimary(true);
        
        // Cập nhật ảnh chính cho sản phẩm
        MarketPlace product = productImage.getProduct();
        product.setImageUrl(productImage.getImageUrl());
        marketPlaceRepository.save(product);
        
        ProductImage updatedImage = productImageRepository.save(productImage);
        return productImageMapper.toDTO(updatedImage);
    }
    
    @Override
    @Transactional
    public List<ProductImageDTO> reorderImages(Integer productId, List<Integer> imageIds) {
        // Kiểm tra tồn tại sản phẩm
        if (!marketPlaceRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        
        // Kiểm tra danh sách ID ảnh
        if (imageIds == null || imageIds.isEmpty()) {
            throw new BadRequestException("Danh sách ID ảnh không được để trống");
        }
        
        // Danh sách ảnh hiện tại
        List<ProductImage> currentImages = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        
        // Kiểm tra số lượng ảnh
        if (currentImages.size() != imageIds.size()) {
            throw new BadRequestException("Số lượng ảnh không khớp");
        }
        
        // Cập nhật thứ tự hiển thị
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
        
        // Lấy danh sách ảnh đã cập nhật
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
        
        // Xóa file từ Cloudinary
        try {
            String publicId = cloudinaryService.extractPublicIdFromUrl(productImage.getImageUrl());
            if (publicId != null) {
                cloudinaryService.deleteImage(publicId);
            }
        } catch (Exception e) {
            // Bỏ qua lỗi khi xóa file
        }
        
        // Xóa ảnh từ cơ sở dữ liệu
        productImageRepository.deleteById(imageId);
    }
    
    @Override
    @Transactional
    public void deleteAllImagesOfProduct(Integer productId) {
        // Kiểm tra tồn tại sản phẩm
        MarketPlace product = marketPlaceRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        // Lấy danh sách ảnh
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        
        // Xóa các file từ Cloudinary
        for (ProductImage image : images) {
            try {
                String publicId = cloudinaryService.extractPublicIdFromUrl(image.getImageUrl());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            } catch (Exception e) {
                // Bỏ qua lỗi khi xóa file
            }
        }
        
        // Xóa tất cả ảnh từ cơ sở dữ liệu
        productImageRepository.deleteByProductId(productId);
        
        // Xóa ảnh chính của sản phẩm
        product.setImageUrl(null);
        marketPlaceRepository.save(product);
    }
} 