package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumPostImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface IForumPostImageService {
    List<ForumPostImageDTO> getALlImagesByPost(Integer postId);
    
    ForumPostImageDTO addImageToPost(Integer postId, ForumPostImageDTO imageDTO);
    
    List<ForumPostImageDTO> addImagesToPost(Integer postId, List<ForumPostImageDTO> imageDTOs);
    
    ForumPostImageDTO uploadImageToPost(Integer postId, MultipartFile imageFile) throws IOException;
    
    List<ForumPostImageDTO> uploadImagesToPost(Integer postId, List<MultipartFile> imageFiles) throws IOException;
    
    ForumPostImageDTO updateImage(Integer imageId, ForumPostImageDTO imageDTO);
    
    void deleteImage(Integer imageId);
    
    void deleteAllImagesOfPost(Integer postId);
    
    List<ForumPostImageDTO> reorderImages(Integer postId, List<Integer> imageIds);
    

    ForumPostImageDTO saveImage(Integer postId, MultipartFile imageFile);
    

    List<ForumPostImageDTO> getImagesByPostId(Integer postId);
    

    void deleteAllImagesByPostId(Integer postId);
    

    Map<String, String> upload(MultipartFile file) throws IOException;
    

    void delete(String publicId) throws IOException;
} 