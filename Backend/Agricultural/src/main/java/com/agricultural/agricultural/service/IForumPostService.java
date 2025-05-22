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
    ForumPostDTO createPost(ForumPostDTO forumPostDto);
    
    ForumPostDTO createPostWithImages(ForumPostRequest request, List<MultipartFile> images);
    
    ForumPostDTO updatePost(int id, ForumPostDTO forumPostDto) throws AccessDeniedException;
    
    void deletePost(int id);
    
    List<ForumPostDTO> getAllPosts();
    
    ForumPostDTO getPostById(int id);
    
    Page<ForumPostDTO> getPosts(Pageable pageable);
    
    Page<ForumPostDTO> getPostsByUserId(Integer userId, Pageable pageable);
    
    Page<ForumPostDTO> getPostsByPrivacyLevel(PrivacyLevel privacyLevel, Pageable pageable);
    
    Page<ForumPostDTO> getPostsByHashtag(String hashtag, Pageable pageable);
    
    Page<ForumPostDTO> getPostsFromConnections(Integer userId, Pageable pageable);
    
    void incrementViewCount(Integer postId, Integer userId);
    
    ForumPostDTO pinPost(Integer postId) throws AccessDeniedException;
    
    ForumPostDTO unpinPost(Integer postId) throws AccessDeniedException;
    
    ForumPostDTO sharePost(Integer originalPostId, String content);
    
    Page<ForumPostDTO> searchPosts(String keyword, Pageable pageable);
}
