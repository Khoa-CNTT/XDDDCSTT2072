package com.agricultural.agricultural.utils;

import com.agricultural.agricultural.config.MomoConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class MomoUtils {

    private final MomoConfig momoConfig;

    /**
     * Tạo chữ ký cho request gửi đến Momo
     * @param data Chuỗi dữ liệu cần tạo chữ ký
     * @return Chuỗi chữ ký đã mã hóa
     */
    public String generateSignature(String data) {
        try {
            String secretKey = momoConfig.getSecretKey();
            log.info("Generating signature with data: {}", data);
            log.info("Secret key: {}", secretKey);
            
            // Sử dụng Apache Commons Codec để tạo chữ ký HMAC SHA256
            String hmac = new HmacUtils(HmacAlgorithms.HMAC_SHA_256, 
                    secretKey.getBytes(StandardCharsets.UTF_8))
                    .hmacHex(data);
            
            log.info("Generated signature: {}", hmac);
            return hmac;
        } catch (Exception e) {
            log.error("Error generating signature: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo chữ ký cho Momo", e);
        }
    }

    /**
     * Xác thực chữ ký nhận được từ Momo
     * @param data Chuỗi dữ liệu gốc
     * @param receivedSignature Chữ ký nhận được từ Momo
     * @return true nếu chữ ký hợp lệ, false nếu không
     */
    public boolean verifySignature(String data, String receivedSignature) {
        String generatedSignature = generateSignature(data);
        boolean isValid = generatedSignature.equals(receivedSignature);
        log.info("Signature verification: {}", isValid ? "Valid" : "Invalid");
        return isValid;
    }
}