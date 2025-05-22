package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.dto.ForumPostImageDTO;
import com.agricultural.agricultural.dto.HashtagDTO;
import com.agricultural.agricultural.dto.request.ForumPostRequest;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.PrivacyLevel;
import com.agricultural.agricultural.service.IForumPostImageService;
import com.agricultural.agricultural.service.IForumPostService;
import com.agricultural.agricultural.service.IHashtagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/posts")
@RequiredArgsConstructor
public class ForumPostController {

    private final IForumPostService forumPostService;
    private final IForumPostImageService forumPostImageService;
    private final IHashtagService hashtagService;


    @PostMapping
    public ResponseEntity<ApiResponse<ForumPostDTO>> createPost(@Valid @RequestBody ForumPostRequest postRequest) {
        ForumPostDTO forumPostDTO = new ForumPostDTO();
        forumPostDTO.setTitle(postRequest.getTitle());
        forumPostDTO.setContent(postRequest.getContent());
        
        // Set các trường mới
        if (postRequest.getPrivacyLevel() != null) {
            forumPostDTO.setPrivacyLevel(postRequest.getPrivacyLevel());
        }
        forumPostDTO.setLocation(postRequest.getLocation());
        forumPostDTO.setFeeling(postRequest.getFeeling());
        forumPostDTO.setBackgroundColor(postRequest.getBackgroundColor());
        forumPostDTO.setAttachmentType(postRequest.getAttachmentType());
        forumPostDTO.setAttachmentUrl(postRequest.getAttachmentUrl());
        
        ForumPostDTO savedPost = forumPostService.createPost(forumPostDTO);
        
        // Xử lý hashtag
        if (postRequest.getHashtags() != null && !postRequest.getHashtags().isEmpty()) {
            hashtagService.addHashtagsToPost(savedPost.getId(), postRequest.getHashtags());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo bài viết thành công", savedPost));
    }


    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ForumPostDTO>> createPostWithImages(
            @Valid @RequestPart("post") ForumPostRequest postRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        ForumPostDTO savedPost = forumPostService.createPostWithImages(postRequest, images);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo bài viết với ảnh thành công", savedPost));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ForumPostDTO>> updatePost(
            @PathVariable int id,
            @Valid @RequestBody ForumPostRequest postRequest) throws AccessDeniedException {
        
        ForumPostDTO forumPostDTO = new ForumPostDTO();
        forumPostDTO.setTitle(postRequest.getTitle());
        forumPostDTO.setContent(postRequest.getContent());
        
        // Set các trường mới
        if (postRequest.getPrivacyLevel() != null) {
            forumPostDTO.setPrivacyLevel(postRequest.getPrivacyLevel());
        }
        forumPostDTO.setLocation(postRequest.getLocation());
        forumPostDTO.setFeeling(postRequest.getFeeling());
        forumPostDTO.setBackgroundColor(postRequest.getBackgroundColor());
        forumPostDTO.setAttachmentType(postRequest.getAttachmentType());
        forumPostDTO.setAttachmentUrl(postRequest.getAttachmentUrl());
        
        ForumPostDTO updatedPost = forumPostService.updatePost(id, forumPostDTO);
        
        // Cập nhật hashtag
        if (postRequest.getHashtags() != null) {
            // Xóa hashtag cũ và thêm hashtag mới
            List<HashtagDTO> oldHashtags = hashtagService.getHashtagsByPostId(id);
            for (HashtagDTO hashtag : oldHashtags) {
                hashtagService.removeHashtagFromPost(id, hashtag.getId());
            }
            
            if (!postRequest.getHashtags().isEmpty()) {
                hashtagService.addHashtagsToPost(id, postRequest.getHashtags());
            }
        }
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật bài viết thành công", updatedPost));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable int id) {
        forumPostService.deletePost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa bài viết thành công", null));
    }


    @GetMapping
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<ForumPostDTO> posts = forumPostService.getPosts(pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết thành công", posts));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ForumPostDTO>> getPostById(
            @PathVariable int id,
            @AuthenticationPrincipal User user) {
        
        // Cập nhật lượt xem nếu người dùng đã đăng nhập
        if (user != null) {
            forumPostService.incrementViewCount(id, user.getId());
        }
        
        ForumPostDTO post = forumPostService.getPostById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy bài viết thành công", post));
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getPostsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.getPostsByUserId(userId, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết của người dùng thành công", posts));
    }


    @GetMapping("/hashtag/{hashtag}")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getPostsByHashtag(
            @PathVariable String hashtag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.getPostsByHashtag(hashtag, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết theo hashtag thành công", posts));
    }
    

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.searchPosts(keyword, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm kiếm bài viết thành công", posts));
    }
    

    @PutMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<ForumPostDTO>> pinPost(@PathVariable Integer id) throws AccessDeniedException {
        ForumPostDTO pinnedPost = forumPostService.pinPost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ghim bài viết thành công", pinnedPost));
    }
    

    @PutMapping("/{id}/unpin")
    public ResponseEntity<ApiResponse<ForumPostDTO>> unpinPost(@PathVariable Integer id) throws AccessDeniedException {
        ForumPostDTO unpinnedPost = forumPostService.unpinPost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bỏ ghim bài viết thành công", unpinnedPost));
    }
    

    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse<ForumPostDTO>> sharePost(
            @PathVariable Integer id,
            @RequestBody(required = false) String content) {
        
        ForumPostDTO sharedPost = forumPostService.sharePost(id, content);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Chia sẻ bài viết thành công", sharedPost));
    }


    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> incrementViewCount(
            @PathVariable Integer id,
            @AuthenticationPrincipal User user) {
        
        forumPostService.incrementViewCount(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm lượt xem thành công", null));
    }
    

    @GetMapping("/{id}/images")
    public ResponseEntity<ApiResponse<List<ForumPostImageDTO>>> getPostImages(@PathVariable Integer id) {
        List<ForumPostImageDTO> images = forumPostImageService.getALlImagesByPost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách ảnh thành công", images));
    }
    

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<ForumPostImageDTO>>> addImagesToPost(
            @PathVariable Integer id,
            @RequestPart(value = "images") List<MultipartFile> images) {
        
        try {
            List<ForumPostImageDTO> savedImages = forumPostImageService.uploadImagesToPost(id, images);
            return ResponseEntity.ok(new ApiResponse<>(true, "Thêm ảnh thành công", savedImages));
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi khi tải ảnh lên: " + e.getMessage(), null));
        }
    }
    

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deletePostImage(
            @PathVariable Integer id,
            @PathVariable Integer imageId) {
        
        forumPostImageService.deleteImage(imageId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa ảnh thành công", null));
    }
    

    @GetMapping("/privacy/{privacyLevel}")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getPostsByPrivacyLevel(
            @PathVariable PrivacyLevel privacyLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.getPostsByPrivacyLevel(privacyLevel, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết theo mức độ riêng tư thành công", posts));
    }

    @GetMapping("/connections")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getPostsFromConnections(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Người dùng chưa đăng nhập", null));
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.getPostsFromConnections(user.getId(), pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết từ những người kết nối thành công", posts));
    }
}
