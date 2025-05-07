package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumPostImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IForumPostImageService {
    // Lấy tất cả ảnh của bài viết
    List<ForumPostImageDTO> getAllImagesByPost(Integer postId);
    
    // Thêm ảnh vào bài viết
    ForumPostImageDTO addImageToPost(Integer postId, ForumPostImageDTO imageDTO);
    
    // Thêm nhiều ảnh vào bài viết
    List<ForumPostImageDTO> addImagesToPost(Integer postId, List<ForumPostImageDTO> imageDTOs);
    
    // Upload ảnh vào bài viết
    ForumPostImageDTO uploadImageToPost(Integer postId, MultipartFile imageFile) throws IOException;
    
    // Upload nhiều ảnh vào bài viết
    List<ForumPostImageDTO> uploadImagesToPost(Integer postId, List<MultipartFile> imageFiles) throws IOException;
    
    // Cập nhật thông tin ảnh
    ForumPostImageDTO updateImage(Integer imageId, ForumPostImageDTO imageDTO);
    
    // Xóa ảnh
    void deleteImage(Integer imageId);
    
    // Xóa tất cả ảnh của bài viết
    void deleteAllImagesOfPost(Integer postId);
    
    // Sắp xếp lại thứ tự ảnh của bài viết
    List<ForumPostImageDTO> reorderImages(Integer postId, List<Integer> imageIds);
} 