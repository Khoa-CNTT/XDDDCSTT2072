package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.service.impl.ForumPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/posts")
@RequiredArgsConstructor
public class ForumPostController {
    private final ForumPostService forumPostService;

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
}
