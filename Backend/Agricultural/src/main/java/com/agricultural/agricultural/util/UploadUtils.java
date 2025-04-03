package com.agricultural.agricultural.util;

<<<<<<< HEAD
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
=======
import org.apache.tomcat.jni.FileInfo;

import java.util.Map;

public class UploadUtils {
    public static final String IMAGE_UPLOAD_FOLDER = "user-avatars";

//    public Map buildImageUploadParams(FileInfo file) {
//        if (file == null || file.getId() == null)
//            throw new RuntimeException("Không thể upload hình ảnh của bạn chưa được lưu");
//
//        String publicId = String.format("%s/%s", IMAGE_UPLOAD_FOLDER, file.getId());
//
//        return ObjectUtils.asMap(
//                "public_id", publicId,
//                "overwrite", true,
//                "resource_type", "image"
//        );
//    }
>>>>>>> dev
}
