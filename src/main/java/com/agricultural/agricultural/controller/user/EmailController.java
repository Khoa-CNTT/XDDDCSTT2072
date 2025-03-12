package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.service.impl.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${api.prefix}/email")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendTestEmail(@RequestParam String to) {
        emailService.sendEmail(to, "Test Email", "Hello, đây là email test từ Spring Boot!");
        return ResponseEntity.ok("Email đã được gửi thành công!");
    }
}
