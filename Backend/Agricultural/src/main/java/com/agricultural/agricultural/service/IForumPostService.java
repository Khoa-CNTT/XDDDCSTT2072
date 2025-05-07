package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.ForumPostDTO;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface IForumPostService {
    // Tạo bài viết mới
    ForumPostDTO createPost(ForumPostDTO forumPostDto);
    
    // Cập nhật bài viết
    ForumPostDTO updatePost(int id, ForumPostDTO forumPostDto) throws AccessDeniedException;
    
    // Xóa bài viết
    void deletePost(int id);
    
    // Lấy tất cả bài viết
    List<ForumPostDTO> getAllPosts();
    
    // Lấy bài viết theo ID
    ForumPostDTO getPostById(int id);
}
