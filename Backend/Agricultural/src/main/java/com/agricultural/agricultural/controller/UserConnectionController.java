package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.UserConnectionDTO;
import com.agricultural.agricultural.dto.response.ApiResponse;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.service.IUserConnectionService;
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

@RestController
@RequestMapping("${api.prefix}/connections")
@RequiredArgsConstructor
public class UserConnectionController {

    private final IUserConnectionService userConnectionService;


    @PostMapping("/request/{targetUserId}")
    public ResponseEntity<ApiResponse<UserConnectionDTO>> sendConnectionRequest(
            @PathVariable Integer targetUserId,
            @AuthenticationPrincipal User user) {
        
        try {
            UserConnectionDTO connection = userConnectionService.sendConnectionRequest(user.getId(), targetUserId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Gửi yêu cầu kết nối thành công", connection));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }


    @PutMapping("/accept/{requesterId}")
    public ResponseEntity<ApiResponse<UserConnectionDTO>> acceptConnectionRequest(
            @PathVariable Integer requesterId,
            @AuthenticationPrincipal User user) {
        
        try {
            UserConnectionDTO connection = userConnectionService.acceptConnectionRequest(user.getId(), requesterId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Chấp nhận yêu cầu kết nối thành công", connection));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }


    @PutMapping("/reject/{requesterId}")
    public ResponseEntity<ApiResponse<UserConnectionDTO>> rejectConnectionRequest(
            @PathVariable Integer requesterId,
            @AuthenticationPrincipal User user) {
        
        try {
            UserConnectionDTO connection = userConnectionService.rejectConnectionRequest(user.getId(), requesterId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Từ chối yêu cầu kết nối thành công", connection));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }


    @PostMapping("/block/{targetUserId}")
    public ResponseEntity<ApiResponse<UserConnectionDTO>> blockUser(
            @PathVariable Integer targetUserId,
            @AuthenticationPrincipal User user) {
        
        try {
            UserConnectionDTO connection = userConnectionService.blockUser(user.getId(), targetUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Chặn người dùng thành công", connection));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }


    @DeleteMapping("/unblock/{targetUserId}")
    public ResponseEntity<ApiResponse<UserConnectionDTO>> unblockUser(
            @PathVariable Integer targetUserId,
            @AuthenticationPrincipal User user) {
        
        try {
            UserConnectionDTO connection = userConnectionService.unblockUser(user.getId(), targetUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Bỏ chặn người dùng thành công", connection));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }


    @DeleteMapping("/{connectedUserId}")
    public ResponseEntity<ApiResponse<Void>> removeConnection(
            @PathVariable Integer connectedUserId,
            @AuthenticationPrincipal User user) {
        
        try {
            userConnectionService.removeConnection(user.getId(), connectedUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa kết nối thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }


    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserConnectionDTO>>> getUserConnections(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserConnectionDTO> connections = userConnectionService.getUserConnections(user.getId(), pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách kết nối thành công", connections));
    }


    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<UserConnectionDTO>>> getPendingRequests(
            @AuthenticationPrincipal User user) {
        
        List<UserConnectionDTO> pendingRequests = userConnectionService.getPendingRequests(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách yêu cầu kết nối thành công", pendingRequests));
    }


    @GetMapping("/check/{targetUserId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkConnectionStatus(
            @PathVariable Integer targetUserId,
            @AuthenticationPrincipal User user) {
        
        Map<String, Object> connectionDetails = userConnectionService.checkConnectionStatus(user.getId(), targetUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Kiểm tra trạng thái kết nối thành công", connectionDetails));
    }


    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countUserConnections(@AuthenticationPrincipal User user) {
        long count = userConnectionService.countUserConnections(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Đếm số lượng kết nối thành công", count));
    }


    @GetMapping("/connected-ids")
    public ResponseEntity<ApiResponse<List<Integer>>> getConnectedUserIds(@AuthenticationPrincipal User user) {
        List<Integer> connectedIds = userConnectionService.getConnectedUserIds(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách ID người dùng đã kết nối thành công", connectedIds));
    }


    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UserConnectionDTO>>> getAllUserConnections(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "ACCEPTED") String status) {
        
        try {
            // Tạo câu truy vấn native SQL hoặc JPQL để lấy tất cả kết nối theo cả hai hướng
            // Và trả về danh sách người dùng đã kết nối
            List<UserConnectionDTO> connections = userConnectionService.getAllUserConnections(user.getId(), status);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy tất cả kết nối thành công", connections));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
} 