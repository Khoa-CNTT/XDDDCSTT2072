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


@RestController
@RequestMapping("${api.prefix}/hashtags")
@RequiredArgsConstructor
public class HashtagController {

    private final IHashtagService hashtagService;


    @PostMapping
    public ResponseEntity<ApiResponse<HashtagDTO>> createHashtag(@RequestParam String name) {
        HashtagDTO hashtag = hashtagService.createHashtag(name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo hashtag thành công", hashtag));
    }


    @PostMapping("/find-or-create")
    public ResponseEntity<ApiResponse<HashtagDTO>> findOrCreateHashtag(@RequestParam String name) {
        HashtagDTO hashtag = hashtagService.findOrCreateHashtag(name);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm hoặc tạo hashtag thành công", hashtag));
    }


    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HashtagDTO>>> searchHashtags(@RequestParam String name) {
        List<HashtagDTO> hashtags = hashtagService.findHashtagsByNameContaining(name);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm kiếm hashtag thành công", hashtags));
    }


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


    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Set<HashtagDTO>>> addHashtagsToPost(
            @PathVariable Integer postId,
            @RequestBody List<String> hashtagNames) {
        
        Set<HashtagDTO> hashtags = hashtagService.addHashtagsToPost(postId, hashtagNames);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm hashtag vào bài viết thành công", hashtags));
    }


    @DeleteMapping("/post/{postId}/hashtag/{hashtagId}")
    public ResponseEntity<ApiResponse<Void>> removeHashtagFromPost(
            @PathVariable Integer postId,
            @PathVariable Integer hashtagId) {
        
        hashtagService.removeHashtagFromPost(postId, hashtagId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa hashtag khỏi bài viết thành công", null));
    }


    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<HashtagDTO>>> getTrendingHashtags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HashtagDTO> hashtags = hashtagService.getTrendingHashtags(pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hashtag xu hướng thành công", hashtags));
    }


    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<HashtagDTO>>> getHashtagsByPostId(@PathVariable Integer postId) {
        List<HashtagDTO> hashtags = hashtagService.getHashtagsByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hashtag của bài viết thành công", hashtags));
    }


    @PutMapping("/{hashtagId}/update-count")
    public ResponseEntity<ApiResponse<Void>> updatePostCount(@PathVariable Integer hashtagId) {
        hashtagService.updatePostCount(hashtagId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật số lượng bài viết thành công", null));
    }
} 