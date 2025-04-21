package com.agricultural.agricultural.utils;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Component
public class UploadUtils {
    public static final String USER_UPLOAD_FOLDER = "user-avatars";
    
    @Autowired
    private Cloudinary cloudinary;
    
    /**
     * Upload an image to Cloudinary
     * @param file The file to upload
     * @return Map containing the upload result
     * @throws IOException If upload fails
     */
    public Map uploadImage(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", USER_UPLOAD_FOLDER,
                        "resource_type", "auto"
                )
        );
    }
    
    /**
     * Delete an image from Cloudinary
     * @param publicId The public ID of the image to delete
     * @return Map containing the deletion result
     * @throws IOException If deletion fails
     */
    public Map deleteImage(String publicId) throws IOException {
        return cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
        );
    }
}
