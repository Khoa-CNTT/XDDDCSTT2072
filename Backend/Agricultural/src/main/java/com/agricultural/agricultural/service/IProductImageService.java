package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ProductImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IProductImageService {
    
    List<ProductImageDTO> getAllImagesByProduct(Integer productId);
    
    ProductImageDTO getPrimaryImage(Integer productId);
    
    ProductImageDTO addImageToProduct(Integer productId, ProductImageDTO imageDTO);
    
    ProductImageDTO uploadImageToProduct(Integer productId, MultipartFile file,
                                        String altText, String title, Boolean isPrimary) throws IOException;
    
    List<ProductImageDTO> uploadImagesToProduct(Integer productId, List<MultipartFile> files) throws IOException;
    
    ProductImageDTO updateImage(Integer imageId, ProductImageDTO imageDTO);
    
    ProductImageDTO setPrimaryImage(Integer imageId);
    
    List<ProductImageDTO> reorderImages(Integer productId, List<Integer> imageIds);
    
    void deleteImage(Integer imageId);
    
    void deleteAllImagesOfProduct(Integer productId);
} 