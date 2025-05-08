package com.agricultural.agricultural.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface ICloudinaryService {

    /**
     * Tải lên hình ảnh lên Cloudinary
     *
     * @param file File cần tải lên
     * @param folder Thư mục lưu trữ trên Cloudinary
     * @return URL của hình ảnh đã tải lên
     * @throws IOException Nếu có lỗi khi tải lên
     */
    String uploadImage(MultipartFile file, String folder) throws IOException;

    /**
     * Tải lên hình ảnh lên Cloudinary với tên tùy chỉnh
     *
     * @param file File cần tải lên
     * @param folder Thư mục lưu trữ trên Cloudinary
     * @param fileName Tên file (không bao gồm phần mở rộng)
     * @return URL của hình ảnh đã tải lên
     * @throws IOException Nếu có lỗi khi tải lên
     */
    String uploadImage(MultipartFile file, String folder, String fileName) throws IOException;

    /**
     * Xóa hình ảnh từ Cloudinary
     *
     * @param publicId Public ID của hình ảnh (có thể trích xuất từ URL)
     * @return Kết quả xóa
     * @throws IOException Nếu có lỗi khi xóa
     */
    Map<String, Object> deleteImage(String publicId) throws IOException;

    /**
     * Trích xuất Public ID từ URL Cloudinary
     *
     * @param cloudinaryUrl URL của hình ảnh trên Cloudinary
     * @return Public ID của hình ảnh
     */
    String extractPublicIdFromUrl(String cloudinaryUrl);
} 