package com.agricultural.agricultural.utils;

import com.agricultural.agricultural.config.VNPAYConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;
import java.text.Normalizer;

@Slf4j
@Component
public class VNPayUtils {

    private final VNPAYConfig vnpayConfig;

    public VNPayUtils(VNPAYConfig vnpayConfig) {
        this.vnpayConfig = vnpayConfig;
        // Log giá trị hash secret để kiểm tra
        log.info("========== THÔNG TIN CẤU HÌNH VNPAY ==========");
        log.info("VNPAY tmn-code từ config: [{}]", vnpayConfig.getTmnCode());
        log.info("VNPAY hash-secret từ config: [{}]", vnpayConfig.getHashSecret());
        log.info("VNPAY url từ config: [{}]", vnpayConfig.getUrl());
        log.info("VNPAY version từ config: [{}]", vnpayConfig.getVersion());
        log.info("VNPAY command từ config: [{}]", vnpayConfig.getCommand());
        log.info("=========================================");
        
        // Hard-code hash secret để test
        String expectedSecret = "98344NMN3SQ9PXJECUJEZG6EMSM8X1F9";
        log.info("VNPAY Hash Secret mong đợi: [{}]", expectedSecret);
        log.info("So sánh hash secret: [{}]", expectedSecret.equals(vnpayConfig.getHashSecret()));
        
        // Debug đặc biệt: So sánh từng ký tự
        debugCompareStrings(expectedSecret, vnpayConfig.getHashSecret());
    }
    
    /**
     * Debug đặc biệt: So sánh từng ký tự của hai chuỗi
     */
    private void debugCompareStrings(String expected, String actual) {
        log.info("===== SO SÁNH CHI TIẾT TỪNG KÝ TỰ HASH SECRET =====");
        log.info("Độ dài expected: {}, Độ dài actual: {}", expected.length(), actual.length());
        
        int minLength = Math.min(expected.length(), actual.length());
        for (int i = 0; i < minLength; i++) {
            char expChar = expected.charAt(i);
            char actChar = actual.charAt(i);
            boolean isMatch = expChar == actChar;
            log.info("Vị trí {}: expected [{}] ({}), actual [{}] ({}), trùng khớp: {}", 
                    i, expChar, (int)expChar, actChar, (int)actChar, isMatch);
        }
        
        // Nếu độ dài khác nhau, log ký tự còn lại
        if (expected.length() > actual.length()) {
            for (int i = minLength; i < expected.length(); i++) {
                log.info("Vị trí {} chỉ có trong expected: [{}] ({})", 
                        i, expected.charAt(i), (int)expected.charAt(i));
            }
        } else if (actual.length() > expected.length()) {
            for (int i = minLength; i < actual.length(); i++) {
                log.info("Vị trí {} chỉ có trong actual: [{}] ({})", 
                        i, actual.charAt(i), (int)actual.charAt(i));
            }
        }
        log.info("================================================");
    }

    /**
     * Lấy thời gian hiện tại theo định dạng yyyyMMddHHmmss
     */
    public String getCurrentDateTime() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        return formatter.format(cld.getTime());
    }

    /**
     * Tạo số ngẫu nhiên với độ dài xác định
     */
    public String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Tạo URL thanh toán VNPAY
     * @param orderId ID của đơn hàng
     * @param amount Số tiền thanh toán (VND)
     * @param orderInfo Mô tả đơn hàng
     * @param returnUrl URL callback khi thanh toán hoàn tất
     * @param ipAddress Địa chỉ IP của người dùng
     * @return URL thanh toán VNPAY
     */
    public String createPaymentUrl(Long orderId, Long amount, String orderInfo, String returnUrl, String ipAddress) {
        try {
            log.info("===== BẮT ĐẦU TẠO URL THANH TOÁN VNPAY =====");
            
            // 1. Lấy thông tin cấu hình
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_TmnCode = vnpayConfig.getTmnCode().trim();
            String vnp_HashSecret = vnpayConfig.getHashSecret().trim();
            String vnp_Url = vnpayConfig.getUrl().trim();
            
            log.info("VNPAY Config - TMN Code: [{}], Hash Secret: [{}], URL: [{}], Version: [{}]", 
                vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_Version);
            
            // 2. Fix địa chỉ IP - chuyển IPv6 thành IPv4
            if (ipAddress != null && ipAddress.equals("0:0:0:0:0:0:0:1")) {
                ipAddress = "127.0.0.1";
            }
            
            // 3. Tạo tham số giao dịch
            String vnp_TxnRef = String.valueOf(orderId) + getRandomNumber(6);
            String vnp_CreateDate = getCurrentDateTime();
            log.info("VNPAY TxnRef: [{}], CreateDate: [{}]", vnp_TxnRef, vnp_CreateDate);
            
            // 4. Xử lý orderInfo - đảm bảo không có ký tự đặc biệt
            String sanitizedOrderInfo = removeAccent(orderInfo);
            sanitizedOrderInfo = sanitizedOrderInfo.replaceAll("[^a-zA-Z0-9\\s]", "");
            log.info("Original OrderInfo: [{}], Sanitized OrderInfo: [{}]", orderInfo, sanitizedOrderInfo);
            
            // 5. Tạo Map chứa các tham số thanh toán
            Map<String, String> vnp_Params = new TreeMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_IpAddr", ipAddress);
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_OrderInfo", sanitizedOrderInfo);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_ReturnUrl", returnUrl);
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            
            // Log thông tin tham số để debug
            log.info("VNPAY Payment Parameters:");
            for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
                log.info("  {} = {}", entry.getKey(), entry.getValue());
            }
            
            // 6. Tạo chuỗi hash data (không cần sắp xếp vì đã dùng TreeMap)
            StringBuilder hashData = new StringBuilder();
            for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
                String fieldName = entry.getKey();
                String fieldValue = entry.getValue();
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    // Xử lý ký tự đặc biệt trong URL
                    if (hashData.charAt(hashData.length() - 1) == '+') {
                        hashData.setCharAt(hashData.length() - 1, ' ');
                    }
                    hashData.append('&');
                }
            }
            
            // Xóa ký tự '&' cuối cùng
            if (hashData.length() > 0) {
                hashData.setLength(hashData.length() - 1);
            }
            
            String hashDataStr = hashData.toString();
            log.info("VNPAY Raw Hash Data: [{}]", hashDataStr);
            
            // 7. Tạo chữ ký
            String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashDataStr);
            log.info("VNPAY Secure Hash: [{}]", vnp_SecureHash);
            
            // 8. Xây dựng URL cuối cùng
            String paymentUrl = vnp_Url + "?" + hashDataStr + "&vnp_SecureHash=" + vnp_SecureHash;
            
            log.info("VNPAY Final Payment URL: [{}]", paymentUrl);
            log.info("===== KẾT THÚC TẠO URL THANH TOÁN VNPAY =====");
            
            return paymentUrl;
        } catch (UnsupportedEncodingException e) {
            log.error("Lỗi tạo URL thanh toán VNPAY: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo URL thanh toán VNPAY", e);
        }
    }

    /**
     * Tạo chuỗi hash từ tất cả các trường - dùng cho việc xác thực callback
     */
    public String hashAllFields(Map<String, String> fields) {
        log.info("===== BẮT ĐẦU HASH ALL FIELDS =====");
        
        // Loại bỏ vnp_SecureHash và vnp_SecureHashType
        Map<String, String> vnp_Params = new TreeMap<>(fields);
        vnp_Params.remove("vnp_SecureHash");
        vnp_Params.remove("vnp_SecureHashType");
        
        log.info("VNPAY callback params (sau khi loại bỏ SecureHash):");
        for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
            log.info("  {} = {}", entry.getKey(), entry.getValue());
        }
        
        // Tạo chuỗi hash data đúng chuẩn VNPAY
        StringBuilder hashData = new StringBuilder();
        try {
            for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
                String fieldName = entry.getKey();
                String fieldValue = entry.getValue();
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Thêm fieldName=fieldValue vào chuỗi hash
                    hashData.append(fieldName).append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    
                    // Xử lý ký tự đặc biệt trong URL
                    if (hashData.charAt(hashData.length() - 1) == '+') {
                        hashData.setCharAt(hashData.length() - 1, ' ');
                    }
                    
                    hashData.append('&');
                }
            }
            
            // Loại bỏ ký tự & cuối cùng
            if (hashData.length() > 0) {
                hashData.setLength(hashData.length() - 1);
            }
            
            String hashDataStr = hashData.toString();
            log.info("VNPAY Raw Hash Data: [{}]", hashDataStr);
            
            // Lấy hashSecret từ config
            String hashSecret = vnpayConfig.getHashSecret().trim();
            log.info("VNPAY Hash Secret: [{}]", hashSecret);
            
            // Tạo chữ ký với phương thức chuẩn
            String hash = hmacSHA512(hashSecret, hashDataStr);
            log.info("VNPAY Hash Result: [{}]", hash);
            log.info("===== KẾT THÚC HASH ALL FIELDS =====");
            
            return hash;
        } catch (UnsupportedEncodingException e) {
            log.error("Lỗi tạo hash từ fields: {}", e.getMessage(), e);
            return "";
        }
    }

    /**
     * Xác thực chữ ký từ VNPAY callback
     * @param fields Map các tham số từ VNPAY
     * @return Kết quả xác thực (true/false)
     */
    public boolean validateVnpayCallback(Map<String, String> fields) {
        log.info("===== BẮT ĐẦU XÁC THỰC CHỮ KÝ VNPAY =====");
        
        // Kiểm tra secure hash
        String vnpSecureHash = fields.get("vnp_SecureHash");
        
        if (vnpSecureHash == null) {
            log.error("VNPAY Validate - vnp_SecureHash is null");
            return false;
        }
        
        log.info("VNPAY SecureHash received: [{}]", vnpSecureHash);
        
        // Tạo hash để so sánh
        String calculatedHash = hashAllFields(fields);
        log.info("VNPAY SecureHash calculated: [{}]", calculatedHash);
        
        // So sánh hash đã tính với hash nhận được
        boolean isValid = calculatedHash.equals(vnpSecureHash);
        log.info("VNPAY Validate - Kết quả validation: {}", isValid);
        log.info("===== KẾT THÚC XÁC THỰC CHỮ KÝ VNPAY =====");
        
        return isValid;
    }

    /**
     * Tạo mã hash HMAC_SHA512 - Phương thức chuẩn của VNPAY
     */
    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException("Key hoặc data không được null");
            }
            
            log.info("HMAC-SHA512 - Key: [{}]", key);
            log.info("HMAC-SHA512 - Data: [{}]", data);
            
            final Mac hmac = Mac.getInstance("HmacSHA512");
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA512");
            hmac.init(secretKey);
            
            byte[] hmacData = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            // Chuyển byte array thành chuỗi hex
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacData) {
                sb.append(String.format("%02x", b & 0xff));  // chuyển byte thành hex
            }
            
            String result = sb.toString();
            log.info("HMAC-SHA512 - Result: [{}]", result);
            return result;
        } catch (Exception ex) {
            log.error("Lỗi tạo HMAC-SHA512: {}", ex.getMessage(), ex);
            return "";
        }
    }
    
    /**
     * Tạo mã hash HMAC_SHA512 - Phương thức 2 (thay đổi)
     */
    public String hmacSHA512_Alternative1(final String key, final String data) {
        try {
            log.info("HMAC-SHA512 (Method 2) - Input data: [{}]", data);
            log.info("HMAC-SHA512 (Method 2) - Input key: [{}]", key);
            
            Mac sha512_HMAC = Mac.getInstance("HmacSHA512");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512_HMAC.init(secret_key);
            byte[] hash = sha512_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            
            String result = sb.toString();
            log.info("HMAC-SHA512 (Method 2) output hash: [{}]", result);
            return result;
        } catch (Exception e) {
            log.error("Lỗi tạo chữ ký HMAC-SHA512 (Method 2): {}", e.getMessage(), e);
            return "";
        }
    }
    
    /**
     * Tạo mã hash HMAC_SHA512 - Phương thức 3 (sử dụng Base64)
     */
    public String hmacSHA512_Alternative2(final String key, final String data) {
        try {
            log.info("HMAC-SHA512 (Method 3) - Input data: [{}]", data);
            log.info("HMAC-SHA512 (Method 3) - Input key: [{}]", key);
            
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
            hmac.init(keySpec);
            
            byte[] hmacBytes = hmac.doFinal(data.getBytes());
            
            // Convert to hex format
            StringBuilder result = new StringBuilder();
            for (byte b : hmacBytes) {
                result.append(String.format("%02x", b & 0xff));
            }
            
            String hashResult = result.toString();
            log.info("HMAC-SHA512 (Method 3) output hash: [{}]", hashResult);
            return hashResult;
        } catch (Exception e) {
            log.error("Lỗi tạo chữ ký HMAC-SHA512 (Method 3): {}", e.getMessage(), e);
            return "";
        }
    }

    /**
     * Lấy địa chỉ IP của người dùng từ request
     * @param request HttpServletRequest
     * @return Địa chỉ IP
     */
    public String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }

    /**
     * Loại bỏ dấu tiếng Việt
     */
    private String removeAccent(String s) {
        if (s == null) return "";
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replaceAll("Đ", "D").replaceAll("đ", "d");
    }

    public VNPAYConfig getVnpayConfig() {
        return this.vnpayConfig;
    }
} 
