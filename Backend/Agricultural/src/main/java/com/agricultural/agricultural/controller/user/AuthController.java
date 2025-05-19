package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.components.JwtTokenUtil;
import com.agricultural.agricultural.dto.*;
import com.agricultural.agricultural.dto.request.TokenRefreshRequest;
import com.agricultural.agricultural.dto.response.ErrorResponse;
import com.agricultural.agricultural.dto.response.TokenRefreshResponse;
import com.agricultural.agricultural.entity.RefreshToken;
import com.agricultural.agricultural.exception.TokenRefreshException;
import com.agricultural.agricultural.service.IGoogleService;
import com.agricultural.agricultural.service.IPasswordResetService;
import com.agricultural.agricultural.service.IRefreshTokenService;
import com.agricultural.agricultural.service.IUserService;
import com.agricultural.agricultural.utils.ResponseObject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("${api.prefix}/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IPasswordResetService passwordResetService;
    private final IRefreshTokenService refreshTokenService;
    private final IUserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final IGoogleService googleService;

    // Gửi email reset password
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        passwordResetService.sendPasswordResetEmail(email);
        return ResponseEntity.ok("Email đặt lại mật khẩu đã được gửi!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO requestData) {
        String token = requestData.getToken();
        String newPassword = requestData.getNewPassword();

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Thiếu token hoặc mật khẩu mới!");
        }

        boolean success = passwordResetService.resetPassword(token, newPassword);
        return success ? ResponseEntity.ok("Mật khẩu đã được cập nhật!") :
                ResponseEntity.badRequest().body("Token không hợp lệ hoặc đã hết hạn.");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    try {
                        String token = jwtTokenUtil.generateToken(user);
                        return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                        .error(true)
                                        .message("Không thể tạo mới token: " + e.getMessage())
                                        .build());
                    }
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token không tồn tại trong hệ thống!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestParam("userId") Integer userId) {
        refreshTokenService.deleteByUserId(userId);
        return ResponseEntity.ok(
                ResponseObject.builder()
                        .status("OK")
                        .message("Đăng xuất thành công!")
                        .data(null)
                        .build()
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            userService.changePassword(
                changePasswordDTO.getUserId(),
                changePasswordDTO.getCurrentPassword(),
                changePasswordDTO.getNewPassword()
            );
            
            return ResponseEntity.ok(
                ResponseObject.builder()
                    .status("OK")
                    .message("Đổi mật khẩu thành công!")
                    .data(null)
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                    .error(true)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/google/login")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginDTO googleLoginDTO) {
        try {
            return ResponseEntity.ok(googleService.loginWithGoogle(googleLoginDTO.getIdToken()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                    .error(true)
                    .message("Đăng nhập Google thất bại: " + e.getMessage())
                    .build());
        }
    }
}
