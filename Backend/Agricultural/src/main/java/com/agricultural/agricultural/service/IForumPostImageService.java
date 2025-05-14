package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumPostImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface IForumPostImageService {
    // Lấy tất cả ảnh của bài viết
    List<ForumPostImageDTO> getALlImagesByPost(Integer postId);
    
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
    
    /**
     * Lưu ảnh của bài viết lên Cloudinary
     * @param postId ID của bài viết
     * @param imageFile File ảnh cần lưu
     * @return Thông tin ảnh đã lưu
     */
    ForumPostImageDTO saveImage(Integer postId, MultipartFile imageFile);
    
    /**
     * Lấy danh sách ảnh của bài viết
     * @param postId ID của bài viết
     * @return Danh sách ảnh
     */
    List<ForumPostImageDTO> getImagesByPostId(Integer postId);
    
    /**
     * Xóa tất cả ảnh của bài viết
     * @param postId ID của bài viết
     */
    void deleteAllImagesByPostId(Integer postId);
    
    /**
     * Upload ảnh lên Cloudinary
     * @param file File ảnh cần upload
     * @return Map chứa secure_url và public_id
     * @throws IOException nếu có lỗi khi upload
     */
    Map<String, String> upload(MultipartFile file) throws IOException;
    
    /**
     * Xóa ảnh từ Cloudinary theo public_id
     * @param publicId Public ID của ảnh
     * @throws IOException nếu có lỗi khi xóa
     */
    void delete(String publicId) throws IOException;
} 