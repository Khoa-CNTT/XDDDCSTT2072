package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.ResetPasswordDTO;
import com.agricultural.agricultural.service.IPasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IPasswordResetService passwordResetService;

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


}
