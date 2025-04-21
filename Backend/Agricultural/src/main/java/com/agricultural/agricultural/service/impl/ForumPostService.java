package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.ForumPostMapper;
import com.agricultural.agricultural.repository.IForumPostRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IForumPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumPostService implements IForumPostService {
    @Autowired
    private IForumPostRepository forumPostRepository;
    @Autowired
    private final UserRepository userRepository;

    private final UserDetailsService userDetailsService;

    private final ForumPostMapper forumPostMapper = ForumPostMapper.INSTANCE; // Khởi tạo Mapper

    public ForumPostDTO createPost(ForumPostDTO forumPostDto) {
        if (forumPostDto == null) {
            throw new BadRequestException("Thông tin bài viết không được để trống");
        }
        
        if (forumPostDto.getTitle() == null || forumPostDto.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Tiêu đề bài viết không được để trống");
        }
        
        if (forumPostDto.getContent() == null || forumPostDto.getContent().trim().isEmpty()) {
            throw new BadRequestException("Nội dung bài viết không được để trống");
        }
        
        // Lấy user từ SecurityContextHolder
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOptional = userRepository.findByUserName(username);

        if (userOptional.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin người dùng");
        }

        User user = userOptional.get();

        // Chuyển ForumPostDTO sang ForumPost Entity (không ánh xạ user)
        ForumPost forumPost = forumPostMapper.toEntity(forumPostDto);

        // Gán User vào ForumPost
        forumPost.setUser(user);

        // Cập nhật thời gian tạo bài viết
        forumPost.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        // Lưu vào database
        forumPost = forumPostRepository.save(forumPost);

        // Trả về DTO
        return forumPostMapper.toDTO(forumPost);
    }

    public ForumPostDTO updatePost(int id, ForumPostDTO forumPostDto) throws AccessDeniedException {
        if (forumPostDto == null) {
            throw new BadRequestException("Thông tin bài viết không được để trống");
        }
        
        if (forumPostDto.getTitle() == null || forumPostDto.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Tiêu đề bài viết không được để trống");
        }
        
        if (forumPostDto.getContent() == null || forumPostDto.getContent().trim().isEmpty()) {
            throw new BadRequestException("Nội dung bài viết không được để trống");
        }
        
        // 📌 1. Lấy user hiện tại từ SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        ForumPost forumPost = forumPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id));

        if (!forumPost.getUser().getUsername().equals(currentUsername)) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa bài viết này");
        }

        forumPost.setTitle(forumPostDto.getTitle());
        forumPost.setContent(forumPostDto.getContent());
        forumPost.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        forumPost = forumPostRepository.save(forumPost);

        // 📌 5. Trả về DTO đã cập nhật
        return forumPostMapper.toDTO(forumPost);
    }

    // Xóa bài viết
    public void deletePost(int id) {
        if (!forumPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id);
        }
        forumPostRepository.deleteById(id);
    }

    // Lấy tất cả bài viết
    public List<ForumPostDTO> getAllPosts() {
        List<ForumPost> forumPosts = forumPostRepository.findAll();
        return forumPosts.stream()
                .map(forumPostMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Lấy bài viết theo ID
    public ForumPostDTO getPostById(int id) {
        return forumPostRepository.findById(id)
                .map(forumPostMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id));
    }
}
