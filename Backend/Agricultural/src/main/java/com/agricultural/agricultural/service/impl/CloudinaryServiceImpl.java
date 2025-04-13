package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.config.CloudinaryConfig;
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
        return uploadImage(file, folder, UUID.randomUUID().toString());
    }

    @Override
    public String uploadImage(MultipartFile file, String folder, String fileName) throws IOException {
        Map<String, Object> params = ObjectUtils.asMap(
                "public_id", folder + "/" + fileName,
                "overwrite", true,
                "resource_type", "auto"
        );

        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        return (String) uploadResult.get("secure_url");
    }

    @Override
    public Map<String, Object> deleteImage(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    @Override
    public String extractPublicIdFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return null;
        }
        
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
        String[] parts = cloudinaryUrl.split("/upload/");
        if (parts.length < 2) {
            return null;
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