package com.agricultural.agricultural.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface ICloudinaryService {


    String uploadImage(MultipartFile file, String folder) throws IOException;


    String uploadImage(MultipartFile file, String folder, String fileName) throws IOException;


    Map<String, Object> deleteImage(String publicId) throws IOException;


    String extractPublicIdFromUrl(String cloudinaryUrl);
} 