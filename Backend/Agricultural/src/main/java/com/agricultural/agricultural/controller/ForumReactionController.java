package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.ForumReactionDTO;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.ReactionType;
import com.agricultural.agricultural.service.IForumReactionService;
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
import java.util.Map;

/**
 * Controller quản lý cảm xúc trong forum
 */
@RestController
@RequestMapping("${api.prefix}/reactions")
@RequiredArgsConstructor
public class ForumReactionController {

    private final IForumReactionService forumReactionService;


    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<ForumReactionDTO>> addPostReaction(
            @PathVariable Integer postId,
            @RequestParam ReactionType reactionType,
            @AuthenticationPrincipal User user) {
        
        ForumReactionDTO reaction = forumReactionService.addPostReaction(postId, user.getId(), reactionType);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Thêm cảm xúc thành công", reaction));
    }


    @PostMapping("/reply/{replyId}")
    public ResponseEntity<ApiResponse<ForumReactionDTO>> addReplyReaction(
            @PathVariable Integer replyId,
            @RequestParam ReactionType reactionType,
            @AuthenticationPrincipal User user) {
        
        ForumReactionDTO reaction = forumReactionService.addReplyReaction(replyId, user.getId(), reactionType);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Thêm cảm xúc thành công", reaction));
    }


    @DeleteMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Void>> removePostReaction(
            @PathVariable Integer postId,
            @RequestParam ReactionType reactionType,
            @AuthenticationPrincipal User user) {
        
        boolean removed = forumReactionService.removePostReaction(postId, user.getId(), reactionType);
        if (removed) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa cảm xúc thành công", null));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Không tìm thấy cảm xúc để xóa", null));
        }
    }


    @DeleteMapping("/reply/{replyId}")
    public ResponseEntity<ApiResponse<Void>> removeReplyReaction(
            @PathVariable Integer replyId,
            @RequestParam ReactionType reactionType,
            @AuthenticationPrincipal User user) {
        
        boolean removed = forumReactionService.removeReplyReaction(replyId, user.getId(), reactionType);
        if (removed) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa cảm xúc thành công", null));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Không tìm thấy cảm xúc để xóa", null));
        }
    }


    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<ForumReactionDTO>>> getPostReactions(@PathVariable Integer postId) {
        List<ForumReactionDTO> reactions = forumReactionService.getReactionsByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách cảm xúc thành công", reactions));
    }


    @GetMapping("/reply/{replyId}")
    public ResponseEntity<ApiResponse<List<ForumReactionDTO>>> getReplyReactions(@PathVariable Integer replyId) {
        List<ForumReactionDTO> reactions = forumReactionService.getReactionsByReplyId(replyId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách cảm xúc thành công", reactions));
    }


    @GetMapping("/post/{postId}/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> countPostReactions(@PathVariable Integer postId) {
        Map<String, Integer> counts = forumReactionService.countReactionsByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng cảm xúc thành công", counts));
    }


    @GetMapping("/reply/{replyId}/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> countReplyReactions(@PathVariable Integer replyId) {
        Map<String, Integer> counts = forumReactionService.countReactionsByReplyId(replyId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng cảm xúc thành công", counts));
    }


    @GetMapping("/post/{postId}/user")
    public ResponseEntity<ApiResponse<List<ReactionType>>> getUserPostReactions(
            @PathVariable Integer postId,
            @AuthenticationPrincipal User user) {
        
        List<ReactionType> reactions = forumReactionService.getUserReactionsForPost(postId, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy cảm xúc của người dùng thành công", reactions));
    }


    @GetMapping("/reply/{replyId}/user")
    public ResponseEntity<ApiResponse<List<ReactionType>>> getUserReplyReactions(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User user) {
        
        List<ReactionType> reactions = forumReactionService.getUserReactionsForReply(replyId, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy cảm xúc của người dùng thành công", reactions));
    }


    @GetMapping("/post/{postId}/users")
    public ResponseEntity<ApiResponse<Page<ForumReactionDTO>>> getPostReactionUsers(
            @PathVariable Integer postId,
            @RequestParam ReactionType reactionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ForumReactionDTO> users = forumReactionService.getPostReactionUsers(postId, reactionType, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách người dùng thành công", users));
    }
} 