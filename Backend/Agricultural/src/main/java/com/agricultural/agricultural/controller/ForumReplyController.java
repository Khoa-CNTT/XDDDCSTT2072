package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ForumReplyDTO;
import com.agricultural.agricultural.dto.request.ForumReplyRequest;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.PermissionDenyException;
import com.agricultural.agricultural.service.IForumReplyService;
import com.agricultural.agricultural.util.ResponseObject;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/forum/replies")
@RequiredArgsConstructor
public class ForumReplyController {

    private final IForumReplyService replyService;

    @GetMapping("/post/{postId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ResponseObject> getRootRepliesByPostId(
            @PathVariable Integer postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ForumReplyDTO> repliesPage = replyService.getRootRepliesByPostId(postId, pageable);
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("OK")
                .message("Lấy danh sách bình luận thành công")
                .data(Map.of(
                        "content", repliesPage.getContent(),
                        "totalElements", repliesPage.getTotalElements(),
                        "totalPages", repliesPage.getTotalPages(),
                        "currentPage", page
                ))
                .build());
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<ResponseObject> getRepliesByParentId(
            @PathVariable Integer parentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<ForumReplyDTO> repliesPage = replyService.getRepliesByParentId(parentId, pageable);
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("OK")
                .message("Lấy danh sách bình luận con thành công")
                .data(Map.of(
                        "content", repliesPage.getContent(),
                        "totalElements", repliesPage.getTotalElements(),
                        "totalPages", repliesPage.getTotalPages(),
                        "currentPage", page
                ))
                .build());
    }

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<ResponseObject> getReplyCountByPostId(@PathVariable Integer postId) {
        Long rootCount = replyService.countRootRepliesByPostId(postId);
        Long totalCount = replyService.countAllRepliesByPostId(postId);
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("OK")
                .message("Lấy số lượng bình luận thành công")
                .data(Map.of(
                        "rootCount", rootCount,
                        "totalCount", totalCount
                ))
                .build());
    }

    @PostMapping
    public ResponseEntity<ResponseObject> createReply(
            @Valid @RequestBody ForumReplyRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        ForumReplyDTO createdReply = replyService.createReply(request, currentUser.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseObject.builder()
                        .status("CREATED")
                        .message("Tạo bình luận thành công")
                        .data(createdReply)
                        .build());
    }

    @PutMapping("/{replyId}")
    public ResponseEntity<ResponseObject> updateReply(
            @PathVariable Integer replyId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User currentUser) throws PermissionDenyException {
        
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ResponseObject.builder()
                            .status("ERROR")
                            .message("Nội dung bình luận không được để trống")
                            .build());
        }
        
        ForumReplyDTO updatedReply = replyService.updateReply(replyId, content, currentUser.getId());
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("OK")
                .message("Cập nhật bình luận thành công")
                .data(updatedReply)
                .build());
    }

    @DeleteMapping("/{replyId}")
    public ResponseEntity<ResponseObject> deleteReply(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User currentUser) throws PermissionDenyException {
        
        replyService.deleteReply(replyId, currentUser.getId());
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("OK")
                .message("Xóa bình luận thành công")
                .build());
    }

    @PostMapping("/{replyId}/like")
    public ResponseEntity<ResponseObject> likeReply(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User currentUser) {
        
        ForumReplyDTO likedReply = replyService.likeReply(replyId, currentUser.getId());
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("OK")
                .message("Thích bình luận thành công")
                .data(likedReply)
                .build());
    }

    @PostMapping("/{replyId}/unlike")
    public ResponseEntity<ResponseObject> unlikeReply(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User currentUser) {
        
        ForumReplyDTO unlikedReply = replyService.unlikeReply(replyId, currentUser.getId());
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("OK")
                .message("Bỏ thích bình luận thành công")
                .data(unlikedReply)
                .build());
    }
} 