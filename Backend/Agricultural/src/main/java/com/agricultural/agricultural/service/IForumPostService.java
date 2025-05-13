package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.dto.request.ForumPostRequest;
import com.agricultural.agricultural.entity.enumeration.PrivacyLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface IForumPostService {
    // Tạo bài viết mới
    ForumPostDTO createPost(ForumPostDTO forumPostDto);
    
    // Tạo bài viết với ảnh
    ForumPostDTO createPostWithImages(ForumPostRequest request, List<MultipartFile> images);
    
    // Cập nhật bài viết
    ForumPostDTO updatePost(int id, ForumPostDTO forumPostDto) throws AccessDeniedException;
    
    // Xóa bài viết
    void deletePost(int id);
    
    // Lấy tất cả bài viết
    List<ForumPostDTO> getAllPosts();
    
    // Lấy bài viết theo ID
    ForumPostDTO getPostById(int id);
    
    // Lấy bài viết với phân trang
    Page<ForumPostDTO> getPosts(Pageable pageable);
    
    // Lấy bài viết của một người dùng cụ thể
    Page<ForumPostDTO> getPostsByUserId(Integer userId, Pageable pageable);
    
    // Lấy bài viết theo mức độ riêng tư
    Page<ForumPostDTO> getPostsByPrivacyLevel(PrivacyLevel privacyLevel, Pageable pageable);
    
    // Lấy bài viết theo hashtag
    Page<ForumPostDTO> getPostsByHashtag(String hashtag, Pageable pageable);
    
    // Lấy bài viết từ những người đã kết nối
    Page<ForumPostDTO> getPostsFromConnections(Integer userId, Pageable pageable);
    
    // Thêm lượt xem cho bài viết
    void incrementViewCount(Integer postId, Integer userId);
    
    // Ghim bài viết (dành cho admin hoặc chủ bài viết)
    ForumPostDTO pinPost(Integer postId) throws AccessDeniedException;
    
    // Bỏ ghim bài viết
    ForumPostDTO unpinPost(Integer postId) throws AccessDeniedException;
    
    // Chia sẻ bài viết
    ForumPostDTO sharePost(Integer originalPostId, String content);
    
    // Tìm kiếm bài viết
    Page<ForumPostDTO> searchPosts(String keyword, Pageable pageable);
}
