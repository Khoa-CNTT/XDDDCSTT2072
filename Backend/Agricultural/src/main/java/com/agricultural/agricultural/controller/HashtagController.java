package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.HashtagDTO;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.service.IHashtagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * Controller quản lý hashtag trong forum
 */
@RestController
@RequestMapping("${api.prefix}/hashtags")
@RequiredArgsConstructor
public class HashtagController {

    private final IHashtagService hashtagService;

    /**
     * Tạo hashtag mới
     * @param name Tên hashtag
     * @return Hashtag đã tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HashtagDTO>> createHashtag(@RequestParam String name) {
        HashtagDTO hashtag = hashtagService.createHashtag(name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo hashtag thành công", hashtag));
    }

    /**
     * Tìm hoặc tạo hashtag
     * @param name Tên hashtag
     * @return Hashtag đã tìm hoặc tạo
     */
    @PostMapping("/find-or-create")
    public ResponseEntity<ApiResponse<HashtagDTO>> findOrCreateHashtag(@RequestParam String name) {
        HashtagDTO hashtag = hashtagService.findOrCreateHashtag(name);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm hoặc tạo hashtag thành công", hashtag));
    }

    /**
     * Tìm kiếm hashtag theo tên
     * @param name Phần tên cần tìm
     * @return Danh sách hashtag phù hợp
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HashtagDTO>>> searchHashtags(@RequestParam String name) {
        List<HashtagDTO> hashtags = hashtagService.findHashtagsByNameContaining(name);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm kiếm hashtag thành công", hashtags));
    }

    /**
     * Tìm hashtag chính xác theo tên
     * @param name Tên hashtag
     * @return Hashtag tìm thấy hoặc null
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<HashtagDTO>> getHashtagByName(@PathVariable String name) {
        HashtagDTO hashtag = hashtagService.findHashtagByName(name);
        
        if (hashtag != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Tìm hashtag thành công", hashtag));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Không tìm thấy hashtag với tên: " + name, null));
        }
    }

    /**
     * Thêm nhiều hashtag vào bài viết
     * @param postId ID bài viết
     * @param hashtagNames Danh sách tên hashtag
     * @return Danh sách hashtag đã thêm
     */
    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Set<HashtagDTO>>> addHashtagsToPost(
            @PathVariable Integer postId,
            @RequestBody List<String> hashtagNames) {
        
        Set<HashtagDTO> hashtags = hashtagService.addHashtagsToPost(postId, hashtagNames);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm hashtag vào bài viết thành công", hashtags));
    }

    /**
     * Xóa hashtag khỏi bài viết
     * @param postId ID bài viết
     * @param hashtagId ID hashtag
     * @return Thông báo xóa thành công
     */
    @DeleteMapping("/post/{postId}/hashtag/{hashtagId}")
    public ResponseEntity<ApiResponse<Void>> removeHashtagFromPost(
            @PathVariable Integer postId,
            @PathVariable Integer hashtagId) {
        
        hashtagService.removeHashtagFromPost(postId, hashtagId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa hashtag khỏi bài viết thành công", null));
    }

    /**
     * Lấy các hashtag xu hướng
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách hashtag xu hướng
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<HashtagDTO>>> getTrendingHashtags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HashtagDTO> hashtags = hashtagService.getTrendingHashtags(pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hashtag xu hướng thành công", hashtags));
    }

    /**
     * Lấy tất cả hashtag của một bài viết
     * @param postId ID bài viết
     * @return Danh sách hashtag
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<HashtagDTO>>> getHashtagsByPostId(@PathVariable Integer postId) {
        List<HashtagDTO> hashtags = hashtagService.getHashtagsByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hashtag của bài viết thành công", hashtags));
    }

    /**
     * Cập nhật số lượng bài viết cho hashtag
     * @param hashtagId ID hashtag
     * @return Thông báo cập nhật thành công
     */
    @PutMapping("/{hashtagId}/update-count")
    public ResponseEntity<ApiResponse<Void>> updatePostCount(@PathVariable Integer hashtagId) {
        hashtagService.updatePostCount(hashtagId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật số lượng bài viết thành công", null));
    }
} 