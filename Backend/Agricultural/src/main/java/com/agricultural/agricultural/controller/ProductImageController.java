package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ProductImageDTO;
import com.agricultural.agricultural.service.IProductImageService;
import com.agricultural.agricultural.service.impl.CloudinaryServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/product-images")
@RequiredArgsConstructor
public class ProductImageController {
    
    private final IProductImageService productImageService;
    private final CloudinaryServiceImpl cloudinaryService;
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImageDTO>> getAllImagesByProduct(@PathVariable Integer productId) {
        List<ProductImageDTO> images = productImageService.getAllImagesByProduct(productId);
        return ResponseEntity.ok(images);
    }
    
    @GetMapping("/product/{productId}/primary")
    public ResponseEntity<ProductImageDTO> getPrimaryImage(@PathVariable Integer productId) {
        ProductImageDTO primaryImage = productImageService.getPrimaryImage(productId);
        return ResponseEntity.ok(primaryImage);
    }
    
    @PostMapping(value = "/product/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageDTO> addImageToProduct(
            @PathVariable Integer productId,
            @RequestParam("imageUrl") String imageUrl,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        
        ProductImageDTO imageDTO = ProductImageDTO.builder()
                .imageUrl(imageUrl)
                .altText(altText)
                .title(title)
                .isPrimary(isPrimary)
                .displayOrder(displayOrder)
                .build();
        
        ProductImageDTO savedImage = productImageService.addImageToProduct(productId, imageDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
    }
    
    @PostMapping(value = "/product/{productId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageDTO> uploadImageToProduct(
            @PathVariable Integer productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) throws IOException {
        
        ProductImageDTO uploadedImage = productImageService.uploadImageToProduct(productId, file, altText, title, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedImage);
    }
    
    @PostMapping(value = "/product/{productId}/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ProductImageDTO>> uploadImagesToProduct(
            @PathVariable Integer productId,
            @RequestParam("files") List<MultipartFile> files) throws IOException {
        
        List<ProductImageDTO> uploadedImages = productImageService.uploadImagesToProduct(productId, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedImages);
    }
    
    @PutMapping(value = "/{imageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageDTO> updateImage(
            @PathVariable Integer imageId,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        
        ProductImageDTO imageDTO = ProductImageDTO.builder()
                .imageUrl(imageUrl)
                .altText(altText)
                .title(title)
                .isPrimary(isPrimary)
                .displayOrder(displayOrder)
                .build();
        
        ProductImageDTO updatedImage = productImageService.updateImage(imageId, imageDTO);
        return ResponseEntity.ok(updatedImage);
    }
    
    @PutMapping("/{imageId}/set-primary")
    public ResponseEntity<ProductImageDTO> setPrimaryImage(@PathVariable Integer imageId) {
        ProductImageDTO primaryImage = productImageService.setPrimaryImage(imageId);
        return ResponseEntity.ok(primaryImage);
    }
    
    @PutMapping(value = "/product/{productId}/reorder", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ProductImageDTO>> reorderImages(
            @PathVariable Integer productId,
            @RequestParam("imageIds") String imageIdsString) {
        
        List<Integer> imageIds = Arrays.stream(imageIdsString.split(","))
                .map(Integer::parseInt)
                .collect(Collectors.toList());
        
        List<ProductImageDTO> reorderedImages = productImageService.reorderImages(productId, imageIds);
        return ResponseEntity.ok(reorderedImages);
    }
    
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer imageId) {
        productImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> deleteAllImagesOfProduct(@PathVariable Integer productId) {
        productImageService.deleteAllImagesOfProduct(productId);
        return ResponseEntity.noContent().build();
    }
}


