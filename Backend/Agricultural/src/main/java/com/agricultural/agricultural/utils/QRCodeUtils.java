package com.agricultural.agricultural.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class QRCodeUtils {

    /**
     * Tạo mã QR dựa vào dữ liệu đầu vào và trả về chuỗi Base64 với tiền tố data URI
     * @param data Dữ liệu để tạo mã QR
     * @param width Chiều rộng của mã QR
     * @param height Chiều cao của mã QR
     * @param includeDataUriPrefix Có thêm tiền tố "data:image/png;base64," hay không
     * @return Chuỗi Base64 của hình ảnh mã QR
     */
    public String generateQRCode(String data, int width, int height, boolean includeDataUriPrefix) {
        try {
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height, hints);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            byte[] imageBytes = outputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            return includeDataUriPrefix ? "data:image/png;base64," + base64Image : base64Image;
        } catch (WriterException e) {
            log.error("Lỗi khi tạo mã QR: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi tạo mã QR", e);
        } catch (IOException e) {
            log.error("Lỗi khi ghi mã QR ra output stream: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi ghi mã QR", e);
        }
    }

    /**
     * Tạo mã QR dựa vào dữ liệu đầu vào và trả về chuỗi Base64 với tiền tố data URI
     * @param data Dữ liệu để tạo mã QR
     * @param width Chiều rộng của mã QR
     * @param height Chiều cao của mã QR
     * @return Chuỗi Base64 của hình ảnh mã QR với tiền tố data URI
     */
    public String generateQRCode(String data, int width, int height) {
        return generateQRCode(data, width, height, true);
    }

    /**
     * Tạo nội dung QR cho VNPAY dựa vào URL thanh toán
     * @param paymentUrl URL thanh toán từ VNPAY
     * @return Nội dung đã định dạng cho mã QR
     */
    public String createVNPayQRContent(String paymentUrl) {
        log.info("Tạo nội dung QR cho URL thanh toán: {}", paymentUrl);
        return paymentUrl;
    }

    /**
     * Tạo nội dung QR theo chuẩn điện tử thông thường
     * @param merchantName Tên đơn vị chấp nhận thanh toán
     * @param terminalId Mã đơn vị
     * @param amount Số tiền thanh toán
     * @param currency Loại tiền tệ
     * @param description Mô tả giao dịch
     * @param transactionId Mã giao dịch
     * @return Chuỗi nội dung đã định dạng cho mã QR
     */
    public String createStandardQRContent(String merchantName, String terminalId, 
                                        Long amount, String currency, 
                                        String description, String transactionId) {
        StringBuilder qrContent = new StringBuilder();
        qrContent.append("00").append("02"); // Phiên bản EMV-QR
        
        // Thông tin đơn vị chấp nhận thanh toán
        qrContent.append("01").append(String.format("%02d", merchantName.length())).append(merchantName);
        
        // Mã đơn vị
        qrContent.append("02").append(String.format("%02d", terminalId.length())).append(terminalId);
        
        // Loại tiền tệ
        qrContent.append("53").append("03").append(currency);
        
        // Số tiền
        qrContent.append("54").append(String.format("%02d", amount.toString().length())).append(amount);
        
        // Quốc gia
        qrContent.append("58").append("02").append("VN");
        
        // Mô tả giao dịch
        if (description != null && !description.isEmpty()) {
            qrContent.append("62").append(String.format("%02d", description.length())).append(description);
        }
        
        // Mã giao dịch
        qrContent.append("05").append(String.format("%02d", transactionId.length())).append(transactionId);
        
        log.info("Đã tạo nội dung QR chuẩn cho giao dịch: {}", transactionId);
        return qrContent.toString();
    }
    
    /**
     * Tạo mã QR với kích thước mặc định 200x200
     * @param url URL thanh toán
     * @param includeDataUriPrefix Có thêm tiền tố "data:image/png;base64," hay không
     * @return chuỗi Base64 của mã QR
     */
    public String generateQRCode(String url, boolean includeDataUriPrefix) {
        return generateQRCode(url, 200, 200, includeDataUriPrefix);
    }
    
    /**
     * Tạo mã QR với kích thước mặc định 200x200
     * @param url URL thanh toán
     * @return chuỗi Base64 của mã QR với tiền tố data URI
     */
    public String generateQRCode(String url) {
        return generateQRCode(url, 200, 200, true);
    }
} 