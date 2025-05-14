package com.agricultural.agricultural.controller.user;

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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/replies")
@RequiredArgsConstructor
public class ForumReplyController {

    private final IForumReplyService replyService;

    /**
     * Lấy danh sách bình luận gốc của bài viết
     * @param postId ID bài viết
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách bình luận gốc
     */
    @GetMapping("/post/{postId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<ForumReplyDTO>>> getRootRepliesByPostId(
            @PathVariable Integer postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ForumReplyDTO> repliesPage = replyService.getRootRepliesByPostId(postId, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true, 
                "Lấy danh sách bình luận thành công", 
                repliesPage));
    }

    /**
     * Lấy danh sách bình luận con của một bình luận
     * @param parentId ID bình luận cha
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách bình luận con
     */
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<Page<ForumReplyDTO>>> getRepliesByParentId(
            @PathVariable Integer parentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<ForumReplyDTO> repliesPage = replyService.getRepliesByParentId(parentId, pageable);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Lấy danh sách bình luận con thành công",
                repliesPage));
    }

    /**
     * Đếm số lượng bình luận của bài viết
     * @param postId ID bài viết
     * @return Số lượng bình luận
     */
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getReplyCountByPostId(@PathVariable Integer postId) {
        Long rootCount = replyService.countRootRepliesByPostId(postId);
        Long totalCount = replyService.countAllRepliesByPostId(postId);
        
        Map<String, Long> counts = Map.of(
                "rootCount", rootCount,
                "totalCount", totalCount);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Lấy số lượng bình luận thành công",
                counts));
    }

    /**
     * Tạo bình luận mới
     * @param request Thông tin bình luận
     * @param currentUser Người dùng hiện tại
     * @return Bình luận đã tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ForumReplyDTO>> createReply(
            @Valid @RequestBody ForumReplyRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        ForumReplyDTO createdReply = replyService.createReply(request, currentUser.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Tạo bình luận thành công",
                        createdReply));
    }

    /**
     * Cập nhật bình luận
     * @param replyId ID bình luận
     * @param request Nội dung cập nhật
     * @param currentUser Người dùng hiện tại
     * @return Bình luận đã cập nhật
     * @throws PermissionDenyException Nếu không có quyền cập nhật
     */
    @PutMapping("/{replyId}")
    public ResponseEntity<ApiResponse<ForumReplyDTO>> updateReply(
            @PathVariable Integer replyId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User currentUser) throws PermissionDenyException {
        
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "Nội dung bình luận không được để trống",
                            null));
        }
        
        ForumReplyDTO updatedReply = replyService.updateReply(replyId, content, currentUser.getId());
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Cập nhật bình luận thành công",
                updatedReply));
    }

    /**
     * Xóa bình luận
     * @param replyId ID bình luận
     * @param currentUser Người dùng hiện tại
     * @return Thông báo xóa thành công
     * @throws PermissionDenyException Nếu không có quyền xóa
     */
    @DeleteMapping("/{replyId}")
    public ResponseEntity<ApiResponse<Void>> deleteReply(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User currentUser) throws PermissionDenyException {
        
        replyService.deleteReply(replyId, currentUser.getId());
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Xóa bình luận thành công",
                null));
    }

    /**
     * Thích bình luận
     * @param replyId ID bình luận
     * @param currentUser Người dùng hiện tại
     * @return Bình luận đã thích
     */
    @PostMapping("/{replyId}/like")
    public ResponseEntity<ApiResponse<ForumReplyDTO>> likeReply(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User currentUser) {
        
        ForumReplyDTO likedReply = replyService.likeReply(replyId, currentUser.getId());
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Thích bình luận thành công",
                likedReply));
    }

    /**
     * Bỏ thích bình luận
     * @param replyId ID bình luận
     * @param currentUser Người dùng hiện tại
     * @return Bình luận đã bỏ thích
     */
    @PostMapping("/{replyId}/unlike")
    public ResponseEntity<ApiResponse<ForumReplyDTO>> unlikeReply(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User currentUser) {
        
        ForumReplyDTO unlikedReply = replyService.unlikeReply(replyId, currentUser.getId());
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Bỏ thích bình luận thành công",
                unlikedReply));
    }
} 