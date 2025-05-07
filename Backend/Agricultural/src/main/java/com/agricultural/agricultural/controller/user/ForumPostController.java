package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.dto.ForumPostImageDTO;
import com.agricultural.agricultural.service.IForumPostImageService;
import com.agricultural.agricultural.service.impl.ForumPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/posts")
@RequiredArgsConstructor
public class ForumPostController {
    private final ForumPostService forumPostService;
    private final IForumPostImageService forumPostImageService;

    // Tạo bài viết
    @PostMapping("/create")
    public ResponseEntity<ForumPostDTO> createPost(@RequestBody ForumPostDTO forumPostDto) {
        ForumPostDTO createdPost = forumPostService.createPost(forumPostDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    // Sửa bài viết
    @PutMapping("/update/{id}")
    public ResponseEntity<ForumPostDTO> updatePost(@PathVariable int id, @RequestBody ForumPostDTO forumPostDto) throws AccessDeniedException {
        ForumPostDTO updatedPost = forumPostService.updatePost(id, forumPostDto);
        if (updatedPost != null) {
            return ResponseEntity.ok(updatedPost);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Xóa bài viết
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable int id) {
        forumPostService.deletePost(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Post deleted successfully");
    }

    // Lấy tất cả bài viết
    @GetMapping("/all")
    public ResponseEntity<List<ForumPostDTO>> getAllPosts() {
        List<ForumPostDTO> posts = forumPostService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // Lấy bài viết theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ForumPostDTO> getPostById(@PathVariable int id) {
        ForumPostDTO forumPostDto = forumPostService.getPostById(id);
        if (forumPostDto != null) {
            return ResponseEntity.ok(forumPostDto);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    // API cho xử lý ảnh
    
    // Lấy tất cả ảnh của bài viết
    @GetMapping("/{postId}/images")
    public ResponseEntity<List<ForumPostImageDTO>> getPostImages(@PathVariable Integer postId) {
        List<ForumPostImageDTO> images = forumPostImageService.getAllImagesByPost(postId);
        return ResponseEntity.ok(images);
    }
    
    // Upload ảnh cho bài viết
    @PostMapping(value = "/{postId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ForumPostImageDTO> uploadImage(
            @PathVariable Integer postId,
            @RequestParam("file") MultipartFile file) throws IOException {
        ForumPostImageDTO uploadedImage = forumPostImageService.uploadImageToPost(postId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedImage);
    }
    
    // Upload nhiều ảnh cho bài viết
    @PostMapping(value = "/{postId}/images/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ForumPostImageDTO>> uploadImages(
            @PathVariable Integer postId,
            @RequestParam("files") List<MultipartFile> files) throws IOException {
        List<ForumPostImageDTO> uploadedImages = forumPostImageService.uploadImagesToPost(postId, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedImages);
    }
    
    // Thêm ảnh đã có sẵn URL vào bài viết
    @PostMapping(value = "/{postId}/images/url")
    public ResponseEntity<ForumPostImageDTO> addImageByUrl(
            @PathVariable Integer postId,
            @RequestBody ForumPostImageDTO imageDto) {
        imageDto.setPostId(postId);
        ForumPostImageDTO addedImage = forumPostImageService.addImageToPost(postId, imageDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(addedImage);
    }
    
    // Xóa ảnh khỏi bài viết
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer imageId) {
        forumPostImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
    
    // Sắp xếp lại thứ tự ảnh
    @PutMapping("/{postId}/images/reorder")
    public ResponseEntity<List<ForumPostImageDTO>> reorderImages(
            @PathVariable Integer postId,
            @RequestBody List<Integer> imageIds) {
        List<ForumPostImageDTO> reorderedImages = forumPostImageService.reorderImages(postId, imageIds);
        return ResponseEntity.ok(reorderedImages);
    }
}
