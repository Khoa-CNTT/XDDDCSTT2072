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

    /**
     * Tạo bài viết mới
     * @param postRequest Thông tin bài viết
     * @return Bài viết đã tạo
     */
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

    /**
     * Tạo bài viết với ảnh đính kèm
     * @param postRequest Thông tin bài viết dạng form-data
     * @param images Danh sách ảnh đính kèm
     * @return Bài viết đã tạo
     */
    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ForumPostDTO>> createPostWithImages(
            @Valid @RequestPart("post") ForumPostRequest postRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        ForumPostDTO savedPost = forumPostService.createPostWithImages(postRequest, images);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo bài viết với ảnh thành công", savedPost));
    }

    /**
     * Cập nhật bài viết
     * @param id ID bài viết
     * @param postRequest Thông tin cập nhật
     * @return Bài viết đã cập nhật
     * @throws AccessDeniedException Nếu không có quyền cập nhật
     */
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

    /**
     * Xóa bài viết
     * @param id ID bài viết
     * @return Thông báo xóa thành công
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable int id) {
        forumPostService.deletePost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa bài viết thành công", null));
    }

    /**
     * Lấy tất cả bài viết với phân trang
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách bài viết phân trang
     */
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

    /**
     * Lấy bài viết theo ID
     * @param id ID bài viết
     * @param user Người dùng hiện tại (để cập nhật lượt xem)
     * @return Bài viết
     */
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

    /**
     * Lấy bài viết theo người dùng
     * @param userId ID người dùng
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách bài viết của người dùng
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getPostsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.getPostsByUserId(userId, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết của người dùng thành công", posts));
    }

    /**
     * Lấy bài viết theo hashtag
     * @param hashtag Tên hashtag
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách bài viết
     */
    @GetMapping("/hashtag/{hashtag}")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getPostsByHashtag(
            @PathVariable String hashtag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.getPostsByHashtag(hashtag, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết theo hashtag thành công", posts));
    }
    
    /**
     * Tìm kiếm bài viết
     * @param keyword Từ khóa tìm kiếm
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách bài viết
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.searchPosts(keyword, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm kiếm bài viết thành công", posts));
    }
    
    /**
     * Ghim bài viết
     * @param id ID bài viết
     * @return Bài viết đã ghim
     */
    @PutMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<ForumPostDTO>> pinPost(@PathVariable Integer id) throws AccessDeniedException {
        ForumPostDTO pinnedPost = forumPostService.pinPost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ghim bài viết thành công", pinnedPost));
    }
    
    /**
     * Bỏ ghim bài viết
     * @param id ID bài viết
     * @return Bài viết đã bỏ ghim
     */
    @PutMapping("/{id}/unpin")
    public ResponseEntity<ApiResponse<ForumPostDTO>> unpinPost(@PathVariable Integer id) throws AccessDeniedException {
        ForumPostDTO unpinnedPost = forumPostService.unpinPost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bỏ ghim bài viết thành công", unpinnedPost));
    }
    
    /**
     * Chia sẻ bài viết
     * @param id ID bài viết gốc
     * @param content Nội dung chia sẻ
     * @return Bài viết đã chia sẻ
     */
    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse<ForumPostDTO>> sharePost(
            @PathVariable Integer id,
            @RequestBody(required = false) String content) {
        
        ForumPostDTO sharedPost = forumPostService.sharePost(id, content);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Chia sẻ bài viết thành công", sharedPost));
    }

    /**
     * Thêm lượt xem cho bài viết
     * @param id ID bài viết
     * @param user Người dùng đang xem
     * @return Thông báo thành công
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> incrementViewCount(
            @PathVariable Integer id,
            @AuthenticationPrincipal User user) {
        
        forumPostService.incrementViewCount(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm lượt xem thành công", null));
    }
    
    /**
     * Lấy danh sách ảnh của bài viết
     * @param id ID bài viết
     * @return Danh sách ảnh
     */
    @GetMapping("/{id}/images")
    public ResponseEntity<ApiResponse<List<ForumPostImageDTO>>> getPostImages(@PathVariable Integer id) {
        List<ForumPostImageDTO> images = forumPostImageService.getALlImagesByPost(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách ảnh thành công", images));
    }
    
    /**
     * Thêm ảnh vào bài viết
     * @param id ID bài viết
     * @param images Danh sách ảnh cần thêm
     * @return Danh sách ảnh đã thêm
     */
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
    
    /**
     * Xóa ảnh khỏi bài viết
     * @param id ID bài viết
     * @param imageId ID ảnh
     * @return Thông báo xóa thành công
     */
    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deletePostImage(
            @PathVariable Integer id,
            @PathVariable Integer imageId) {
        
        forumPostImageService.deleteImage(imageId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa ảnh thành công", null));
    }
    
    /**
     * Lấy bài viết theo mức độ riêng tư
     * @param privacyLevel Mức độ riêng tư
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách bài viết
     */
    @GetMapping("/privacy/{privacyLevel}")
    public ResponseEntity<ApiResponse<Page<ForumPostDTO>>> getPostsByPrivacyLevel(
            @PathVariable PrivacyLevel privacyLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostDTO> posts = forumPostService.getPostsByPrivacyLevel(privacyLevel, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bài viết theo mức độ riêng tư thành công", posts));
    }
}
