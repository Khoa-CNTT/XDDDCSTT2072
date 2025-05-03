package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.config.CloudinaryConfig;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.service.ICloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryServiceImpl implements ICloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryServiceImpl(CloudinaryConfig cloudinaryConfig) {
        this.cloudinary = cloudinaryConfig.getCloudinary();
    }

    @Override
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }
        return uploadImage(file, folder, UUID.randomUUID().toString());
    }

    @Override
    public String uploadImage(MultipartFile file, String folder, String fileName) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }
        
        if (folder == null || folder.trim().isEmpty()) {
            throw new BadRequestException("Thư mục không được để trống");
        }
        
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new BadRequestException("Tên file không được để trống");
        }

        // Log thông tin file trước khi upload
        System.out.println("Đang upload file: " + file.getOriginalFilename() + 
                         ", MIME type: " + file.getContentType() + 
                         ", Kích thước: " + file.getSize() + " bytes");
        System.out.println("Đường dẫn mục tiêu: " + folder + "/" + fileName);

        Map<String, Object> params = ObjectUtils.asMap(
                "public_id", folder + "/" + fileName,
                "overwrite", true,
                "resource_type", "auto"
        );

        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            String secureUrl = (String) uploadResult.get("secure_url");
            System.out.println("Upload thành công. URL: " + secureUrl);
            return secureUrl;
        } catch (Exception e) {
            System.err.println("Lỗi khi upload file lên Cloudinary: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Map<String, Object> deleteImage(String publicId) throws IOException {
        if (publicId == null || publicId.trim().isEmpty()) {
            throw new BadRequestException("Public ID không được để trống");
        }
        
        Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        if (result.get("result").equals("not found")) {
            throw new ResourceNotFoundException("Không tìm thấy ảnh với public ID: " + publicId);
        }
        return result;
    }

    @Override
    public String extractPublicIdFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            throw new BadRequestException("URL không được để trống");
        }
        
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
        String[] parts = cloudinaryUrl.split("/upload/");
        if (parts.length < 2) {
            throw new BadRequestException("URL không hợp lệ");
        }
        
        String publicIdWithVersion = parts[1];
        // Remove version if exists (v1234567890/)
        if (publicIdWithVersion.startsWith("v")) {
            int slashIndex = publicIdWithVersion.indexOf("/");
            if (slashIndex != -1) {
                publicIdWithVersion = publicIdWithVersion.substring(slashIndex + 1);
            }
        }
        
        // Remove file extension
        int dotIndex = publicIdWithVersion.lastIndexOf(".");
        if (dotIndex != -1) {
            publicIdWithVersion = publicIdWithVersion.substring(0, dotIndex);
        }
        
        return publicIdWithVersion;
    }
} 