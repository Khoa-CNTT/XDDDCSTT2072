package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.entity.PasswordResetToken;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.repository.IPasswordResetTokenRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IPasswordResetService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService implements IPasswordResetService {

    private final IUserRepository userRepository;
    private final IPasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;  // 🔥 Dịch vụ gửi email (sẽ tạo sau)
    private final PasswordEncoder passwordEncoder;

    @Override
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Email không tồn tại"));

        // Tạo token reset password
        String token = UUID.randomUUID().toString();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(new Date(System.currentTimeMillis() + 15 * 60 * 1000)); // 15 phút

        tokenRepository.save(passwordResetToken);

        // Gửi email cho user
        String resetLink = "http://localhost:8080/api/auth/reset-password?token=" + token;
        String message = "Click vào link sau để đặt lại mật khẩu: " + resetLink;

        emailService.sendEmail(user.getEmail(), "Đặt lại mật khẩu", message);
    }

    @Override
    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new EntityNotFoundException("Token không hợp lệ"));

        if (resetToken.getExpiryDate().before(new Date())) {
            throw new IllegalStateException("Token đã hết hạn");
        }

        // ✅ Mã hóa mật khẩu trước khi lưu vào database
        User user = resetToken.getUser();
        String encodedPassword = passwordEncoder.encode(newPassword);  // 🔥 Mã hóa mật khẩu
        user.setPassword(encodedPassword);
        userRepository.save(user);

        // ✅ Xóa token sau khi đã đặt lại mật khẩu
        tokenRepository.delete(resetToken);

        return true;
    }

}
