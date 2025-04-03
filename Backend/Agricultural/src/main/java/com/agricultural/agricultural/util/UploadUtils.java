package com.agricultural.agricultural.util;

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
}
