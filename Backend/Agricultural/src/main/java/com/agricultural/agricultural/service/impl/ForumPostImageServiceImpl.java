package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ForumPostImageDTO;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.ForumPostImage;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.ForumPostImageMapper;
import com.agricultural.agricultural.repository.IForumPostImageRepository;
import com.agricultural.agricultural.repository.IForumPostRepository;
import com.agricultural.agricultural.service.ICloudinaryService;
import com.agricultural.agricultural.service.IForumPostImageService;
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
public class ForumPostImageServiceImpl implements IForumPostImageService {

    private final IForumPostImageRepository forumPostImageRepository;
    private final IForumPostRepository forumPostRepository;
    private final ICloudinaryService cloudinaryService;
    private final ForumPostImageMapper forumPostImageMapper = ForumPostImageMapper.INSTANCE;

    @Override
    public List<ForumPostImageDTO> getAllImagesByPost(Integer postId) {
        List<ForumPostImage> images = forumPostImageRepository.findByPostIdOrderByDisplayOrderAsc(postId);
        return forumPostImageMapper.toDTOList(images);
    }

    @Override
    @Transactional
    public ForumPostImageDTO addImageToPost(Integer postId, ForumPostImageDTO imageDTO) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        // Tạo entity từ DTO
        ForumPostImage image = forumPostImageMapper.toEntity(imageDTO);
        image.setPost(post);

        // Nếu không có displayOrder, lấy thứ tự cao nhất + 1
        if (image.getDisplayOrder() == null) {
            Integer maxOrder = forumPostImageRepository.findMaxDisplayOrderByPostId(postId);
            image.setDisplayOrder(maxOrder != null ? maxOrder + 1 : 0);
        }

        // Lưu vào database
        image = forumPostImageRepository.save(image);
        return forumPostImageMapper.toDTO(image);
    }

    @Override
    @Transactional
    public List<ForumPostImageDTO> addImagesToPost(Integer postId, List<ForumPostImageDTO> imageDTOs) {
        if (imageDTOs == null || imageDTOs.isEmpty()) {
            throw new BadRequestException("Danh sách ảnh không được để trống");
        }

        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        List<ForumPostImage> images = new ArrayList<>();
        Integer maxOrder = forumPostImageRepository.findMaxDisplayOrderByPostId(postId);
        int nextOrder = maxOrder != null ? maxOrder + 1 : 0;

        for (ForumPostImageDTO imageDTO : imageDTOs) {
            ForumPostImage image = forumPostImageMapper.toEntity(imageDTO);
            image.setPost(post);
            image.setDisplayOrder(nextOrder++);
            images.add(image);
        }

        // Lưu vào database
        images = forumPostImageRepository.saveAll(images);
        return forumPostImageMapper.toDTOList(images);
    }

    @Override
    @Transactional
    public ForumPostImageDTO uploadImageToPost(Integer postId, MultipartFile imageFile) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new BadRequestException("File ảnh không được để trống");
        }

        // Upload ảnh lên Cloudinary
        String imageUrl = cloudinaryService.uploadImage(imageFile, "forum-posts/" + postId);

        // Tạo đối tượng DTO
        ForumPostImageDTO imageDTO = ForumPostImageDTO.builder()
                .imageUrl(imageUrl)
                .build();

        // Gọi phương thức addImageToPost để lưu vào database
        return addImageToPost(postId, imageDTO);
    }

    @Override
    @Transactional
    public List<ForumPostImageDTO> uploadImagesToPost(Integer postId, List<MultipartFile> imageFiles) throws IOException {
        if (imageFiles == null || imageFiles.isEmpty()) {
            throw new BadRequestException("Danh sách file ảnh không được để trống");
        }

        List<ForumPostImageDTO> imageDTOs = new ArrayList<>();
        for (MultipartFile imageFile : imageFiles) {
            if (imageFile != null && !imageFile.isEmpty()) {
                // Upload ảnh lên Cloudinary
                String imageUrl = cloudinaryService.uploadImage(imageFile, "forum-posts/" + postId);

                // Tạo đối tượng DTO
                ForumPostImageDTO imageDTO = ForumPostImageDTO.builder()
                        .imageUrl(imageUrl)
                        .build();

                imageDTOs.add(imageDTO);
            }
        }

        // Gọi phương thức addImagesToPost để lưu vào database
        return addImagesToPost(postId, imageDTOs);
    }

    @Override
    @Transactional
    public ForumPostImageDTO updateImage(Integer imageId, ForumPostImageDTO imageDTO) {
        ForumPostImage image = forumPostImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với ID: " + imageId));

        // Cập nhật thông tin
        forumPostImageMapper.updateEntityFromDTO(imageDTO, image);

        // Lưu vào database
        image = forumPostImageRepository.save(image);
        return forumPostImageMapper.toDTO(image);
    }

    @Override
    @Transactional
    public void deleteImage(Integer imageId) {
        ForumPostImage image = forumPostImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh với ID: " + imageId));

        // Xóa ảnh khỏi Cloudinary (nếu cần)
        try {
            String publicId = extractPublicIdFromUrl(image.getImageUrl());
            if (publicId != null) {
                cloudinaryService.deleteImage(publicId);
            }
        } catch (Exception e) {
            // Xử lý lỗi khi xóa ảnh từ Cloudinary
        }

        // Xóa khỏi database
        forumPostImageRepository.delete(image);
    }

    @Override
    @Transactional
    public void deleteAllImagesOfPost(Integer postId) {
        List<ForumPostImage> images = forumPostImageRepository.findByPostIdOrderByDisplayOrderAsc(postId);

        // Xóa ảnh khỏi Cloudinary (nếu cần)
        for (ForumPostImage image : images) {
            try {
                String publicId = extractPublicIdFromUrl(image.getImageUrl());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            } catch (Exception e) {
                // Xử lý lỗi khi xóa ảnh từ Cloudinary
            }
        }

        // Xóa khỏi database
        forumPostImageRepository.deleteByPostId(postId);
    }

    @Override
    @Transactional
    public List<ForumPostImageDTO> reorderImages(Integer postId, List<Integer> imageIds) {
        if (imageIds == null || imageIds.isEmpty()) {
            throw new BadRequestException("Danh sách ID ảnh không được để trống");
        }

        // Kiểm tra xem bài viết có tồn tại không
        if (!forumPostRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId);
        }

        // Lấy tất cả ảnh của bài viết
        List<ForumPostImage> images = forumPostImageRepository.findByPostIdOrderByDisplayOrderAsc(postId);
        
        // Kiểm tra xem tất cả các ID trong danh sách có hợp lệ không
        for (Integer imageId : imageIds) {
            if (images.stream().noneMatch(image -> image.getId().equals(imageId))) {
                throw new BadRequestException("Ảnh với ID " + imageId + " không thuộc về bài viết này");
            }
        }

        // Cập nhật thứ tự hiển thị
        List<ForumPostImage> updatedImages = new ArrayList<>();
        IntStream.range(0, imageIds.size()).forEach(i -> {
            Integer imageId = imageIds.get(i);
            images.stream()
                  .filter(image -> image.getId().equals(imageId))
                  .findFirst()
                  .ifPresent(image -> {
                      image.setDisplayOrder(i);
                      updatedImages.add(image);
                  });
        });

        // Lưu vào database
        forumPostImageRepository.saveAll(updatedImages);
        
        // Lấy lại danh sách ảnh theo thứ tự mới
        return forumPostImageMapper.toDTOList(
                forumPostImageRepository.findByPostIdOrderByDisplayOrderAsc(postId)
        );
    }

    // Phương thức hỗ trợ để trích xuất public_id từ URL của Cloudinary
    private String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        // Xử lý url dạng: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/folder/image.jpg
        try {
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) return null;
            
            String filenamePart = parts[1];
            // Xóa phần version nếu có
            if (filenamePart.startsWith("v")) {
                String[] versionParts = filenamePart.split("/", 2);
                if (versionParts.length < 2) return null;
                filenamePart = versionParts[1];
            }
            
            // Xóa phần đuôi file
            int extensionIndex = filenamePart.lastIndexOf(".");
            if (extensionIndex > 0) {
                filenamePart = filenamePart.substring(0, extensionIndex);
            }
            
            return filenamePart;
        } catch (Exception e) {
            return null;
        }
    }
} 