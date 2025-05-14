package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ForumReplyDTO;
import com.agricultural.agricultural.dto.request.ForumReplyRequest;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.PermissionDenyException;
import com.agricultural.agricultural.service.IForumReplyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final IForumReplyService forumReplyService;

    /**
     * Lấy tất cả bình luận gốc của một bài viết
     * @param postId ID của bài viết
     * @return Danh sách các bình luận gốc
     */
    @GetMapping("/post/{postId}/root")
    public ResponseEntity<ApiResponse<List<ForumReplyDTO>>> getRootCommentsByPostId(@PathVariable Integer postId) {
        List<ForumReplyDTO> comments = forumReplyService.getRootRepliesByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bình luận thành công", comments));
    }

    /**
     * Lấy tất cả bình luận gốc của một bài viết với phân trang
     * @param postId ID của bài viết
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách các bình luận gốc theo trang
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Page<ForumReplyDTO>>> getPaginatedRootCommentsByPostId(
            @PathVariable Integer postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<ForumReplyDTO> comments = forumReplyService.getRootRepliesByPostId(postId, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bình luận thành công", comments));
    }

    /**
     * Lấy tất cả bình luận con của một bình luận cha
     * @param parentId ID của bình luận cha
     * @return Danh sách các bình luận con
     */
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<List<ForumReplyDTO>>> getChildCommentsByParentId(@PathVariable Integer parentId) {
        List<ForumReplyDTO> comments = forumReplyService.getRepliesByParentId(parentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bình luận con thành công", comments));
    }

    /**
     * Lấy tất cả bình luận con của một bình luận cha với phân trang
     * @param parentId ID của bình luận cha
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách các bình luận con theo trang
     */
    @GetMapping("/parent/{parentId}/paged")
    public ResponseEntity<ApiResponse<Page<ForumReplyDTO>>> getPaginatedChildCommentsByParentId(
            @PathVariable Integer parentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<ForumReplyDTO> comments = forumReplyService.getRepliesByParentId(parentId, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bình luận con thành công", comments));
    }

    /**
     * Tạo bình luận mới
     * @param request Thông tin bình luận
     * @param user Người dùng hiện tại
     * @return Bình luận đã tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ForumReplyDTO>> createComment(
            @Valid @RequestBody ForumReplyRequest request,
            @AuthenticationPrincipal User user) {
        
        ForumReplyDTO createdComment = forumReplyService.createReply(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo bình luận thành công", createdComment));
    }

    /**
     * Cập nhật nội dung bình luận
     * @param id ID của bình luận
     * @param content Nội dung mới
     * @param user Người dùng hiện tại
     * @return Bình luận đã cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ForumReplyDTO>> updateComment(
            @PathVariable Integer id,
            @RequestBody String content,
            @AuthenticationPrincipal User user) {
        
        try {
            ForumReplyDTO updatedComment = forumReplyService.updateReply(id, content, user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật bình luận thành công", updatedComment));
        } catch (PermissionDenyException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Xóa bình luận
     * @param id ID của bình luận
     * @param user Người dùng hiện tại
     * @return Thông báo xóa thành công
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Integer id,
            @AuthenticationPrincipal User user) {
        
        try {
            forumReplyService.deleteReply(id, user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa bình luận thành công", null));
        } catch (PermissionDenyException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Thích bình luận
     * @param id ID của bình luận
     * @param user Người dùng hiện tại
     * @return Bình luận đã thích
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<ForumReplyDTO>> likeComment(
            @PathVariable Integer id,
            @AuthenticationPrincipal User user) {
        
        ForumReplyDTO likedComment = forumReplyService.likeReply(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thích bình luận thành công", likedComment));
    }

    /**
     * Bỏ thích bình luận
     * @param id ID của bình luận
     * @param user Người dùng hiện tại
     * @return Bình luận đã bỏ thích
     */
    @PostMapping("/{id}/unlike")
    public ResponseEntity<ApiResponse<ForumReplyDTO>> unlikeComment(
            @PathVariable Integer id,
            @AuthenticationPrincipal User user) {
        
        ForumReplyDTO unlikedComment = forumReplyService.unlikeReply(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Bỏ thích bình luận thành công", unlikedComment));
    }

    /**
     * Đếm số lượng bình luận của một bài viết
     * @param postId ID của bài viết
     * @return Số lượng bình luận
     */
    @GetMapping("/count/post/{postId}")
    public ResponseEntity<ApiResponse<Long>> countCommentsByPostId(@PathVariable Integer postId) {
        Long count = forumReplyService.countAllRepliesByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng bình luận thành công", count));
    }

    /**
     * Đếm số lượng bình luận gốc của một bài viết
     * @param postId ID của bài viết
     * @return Số lượng bình luận gốc
     */
    @GetMapping("/count/post/{postId}/root")
    public ResponseEntity<ApiResponse<Long>> countRootCommentsByPostId(@PathVariable Integer postId) {
        Long count = forumReplyService.countRootRepliesByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng bình luận gốc thành công", count));
    }
} 