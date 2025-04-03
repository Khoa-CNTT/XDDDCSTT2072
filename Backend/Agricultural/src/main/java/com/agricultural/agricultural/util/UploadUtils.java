package com.agricultural.agricultural.util;

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


    public Map uploadImage(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", USER_UPLOAD_FOLDER,
                        "resource_type", "auto"
                )
        );
    }


    public Map deleteImage(String publicId) throws IOException {
        return cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
        );
    }
}
