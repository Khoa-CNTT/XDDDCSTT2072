package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ProductImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IProductImageService {
    
    // Lấy tất cả ảnh của sản phẩm
    List<ProductImageDTO> getAllImagesByProduct(Integer productId);
    
    // Lấy ảnh chính của sản phẩm
    ProductImageDTO getPrimaryImage(Integer productId);
    
    // Thêm ảnh mới cho sản phẩm
    ProductImageDTO addImageToProduct(Integer productId, ProductImageDTO imageDTO);
    
    // Thêm ảnh mới cho sản phẩm từ tệp tải lên
    ProductImageDTO uploadImageToProduct(Integer productId, MultipartFile file, 
                                        String altText, String title, Boolean isPrimary) throws IOException;
    
    // Upload nhiều ảnh cho sản phẩm
    List<ProductImageDTO> uploadImagesToProduct(Integer productId, List<MultipartFile> files) throws IOException;
    
    // Cập nhật thông tin của ảnh
    ProductImageDTO updateImage(Integer imageId, ProductImageDTO imageDTO);
    
    // Đặt ảnh là ảnh chính
    ProductImageDTO setPrimaryImage(Integer imageId);
    
    // Sắp xếp lại thứ tự hiển thị
    List<ProductImageDTO> reorderImages(Integer productId, List<Integer> imageIds);
    
    // Xóa ảnh
    void deleteImage(Integer imageId);
    
    // Xóa tất cả ảnh của sản phẩm
    void deleteAllImagesOfProduct(Integer productId);
} 