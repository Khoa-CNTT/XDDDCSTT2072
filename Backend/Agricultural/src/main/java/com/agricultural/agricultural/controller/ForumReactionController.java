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

    /**
     * Thêm cảm xúc cho bài viết
     * @param postId ID bài viết
     * @param reactionType Loại cảm xúc
     * @param user Người dùng hiện tại
     * @return Thông tin cảm xúc đã thêm
     */
    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<ForumReactionDTO>> addPostReaction(
            @PathVariable Integer postId,
            @RequestParam ReactionType reactionType,
            @AuthenticationPrincipal User user) {
        
        ForumReactionDTO reaction = forumReactionService.addPostReaction(postId, user.getId(), reactionType);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Thêm cảm xúc thành công", reaction));
    }

    /**
     * Thêm cảm xúc cho bình luận
     * @param replyId ID bình luận
     * @param reactionType Loại cảm xúc
     * @param user Người dùng hiện tại
     * @return Thông tin cảm xúc đã thêm
     */
    @PostMapping("/reply/{replyId}")
    public ResponseEntity<ApiResponse<ForumReactionDTO>> addReplyReaction(
            @PathVariable Integer replyId,
            @RequestParam ReactionType reactionType,
            @AuthenticationPrincipal User user) {
        
        ForumReactionDTO reaction = forumReactionService.addReplyReaction(replyId, user.getId(), reactionType);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Thêm cảm xúc thành công", reaction));
    }

    /**
     * Xóa cảm xúc khỏi bài viết
     * @param postId ID bài viết
     * @param reactionType Loại cảm xúc
     * @param user Người dùng hiện tại
     * @return Thông báo xóa thành công
     */
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

    /**
     * Xóa cảm xúc khỏi bình luận
     * @param replyId ID bình luận
     * @param reactionType Loại cảm xúc
     * @param user Người dùng hiện tại
     * @return Thông báo xóa thành công
     */
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

    /**
     * Lấy tất cả cảm xúc của một bài viết
     * @param postId ID bài viết
     * @return Danh sách cảm xúc
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<ForumReactionDTO>>> getPostReactions(@PathVariable Integer postId) {
        List<ForumReactionDTO> reactions = forumReactionService.getReactionsByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách cảm xúc thành công", reactions));
    }

    /**
     * Lấy tất cả cảm xúc của một bình luận
     * @param replyId ID bình luận
     * @return Danh sách cảm xúc
     */
    @GetMapping("/reply/{replyId}")
    public ResponseEntity<ApiResponse<List<ForumReactionDTO>>> getReplyReactions(@PathVariable Integer replyId) {
        List<ForumReactionDTO> reactions = forumReactionService.getReactionsByReplyId(replyId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách cảm xúc thành công", reactions));
    }

    /**
     * Đếm số lượng cảm xúc của một bài viết theo loại
     * @param postId ID bài viết
     * @return Map chứa số lượng cảm xúc theo loại
     */
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> countPostReactions(@PathVariable Integer postId) {
        Map<String, Integer> counts = forumReactionService.countReactionsByPostId(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng cảm xúc thành công", counts));
    }

    /**
     * Đếm số lượng cảm xúc của một bình luận theo loại
     * @param replyId ID bình luận
     * @return Map chứa số lượng cảm xúc theo loại
     */
    @GetMapping("/reply/{replyId}/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> countReplyReactions(@PathVariable Integer replyId) {
        Map<String, Integer> counts = forumReactionService.countReactionsByReplyId(replyId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng cảm xúc thành công", counts));
    }

    /**
     * Lấy các loại cảm xúc mà người dùng đã thêm cho bài viết
     * @param postId ID bài viết
     * @param user Người dùng hiện tại
     * @return Danh sách loại cảm xúc
     */
    @GetMapping("/post/{postId}/user")
    public ResponseEntity<ApiResponse<List<ReactionType>>> getUserPostReactions(
            @PathVariable Integer postId,
            @AuthenticationPrincipal User user) {
        
        List<ReactionType> reactions = forumReactionService.getUserReactionsForPost(postId, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy cảm xúc của người dùng thành công", reactions));
    }

    /**
     * Lấy các loại cảm xúc mà người dùng đã thêm cho bình luận
     * @param replyId ID bình luận
     * @param user Người dùng hiện tại
     * @return Danh sách loại cảm xúc
     */
    @GetMapping("/reply/{replyId}/user")
    public ResponseEntity<ApiResponse<List<ReactionType>>> getUserReplyReactions(
            @PathVariable Integer replyId,
            @AuthenticationPrincipal User user) {
        
        List<ReactionType> reactions = forumReactionService.getUserReactionsForReply(replyId, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy cảm xúc của người dùng thành công", reactions));
    }

    /**
     * Lấy danh sách người dùng đã thêm một loại cảm xúc cho bài viết
     * @param postId ID bài viết
     * @param reactionType Loại cảm xúc
     * @param page Số trang
     * @param size Kích thước trang
     * @return Danh sách người dùng
     */
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