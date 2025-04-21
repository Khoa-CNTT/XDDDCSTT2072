package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    
    public void sendEmail(String to, String subject, String content) {
        if (to == null || to.trim().isEmpty()) {
            throw new BadRequestException("Địa chỉ email người nhận không được để trống");
        }
        
        if (subject == null || subject.trim().isEmpty()) {
            throw new BadRequestException("Tiêu đề email không được để trống");
        }
        
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Nội dung email không được để trống");
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
        } catch (MailException e) {
            throw new BadRequestException("Không thể gửi email: " + e.getMessage());
        }
    }
}
