package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.repository.ForumPostRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IForumPostService;
import com.agricultural.agricultural.mapper.ForumPostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private ForumPostRepository forumPostRepository;
    @Autowired
    private final UserRepository userRepository;

    private final UserDetailsService userDetailsService;

    private final ForumPostMapper forumPostMapper = ForumPostMapper.INSTANCE; // Khởi tạo Mapper

    public ForumPostDTO createPost(ForumPostDTO forumPostDto) {
        // Lấy user từ SecurityContextHolder
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOptional = userRepository.findByUserName(username);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
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
        // 📌 1. Lấy user hiện tại từ SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        ForumPost forumPost = forumPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại!"));

        if (!forumPost.getUser().getUsername().equals(currentUsername)) {
            throw new AccessDeniedException("Bạn không có quyền chỉnh sửa bài viết này!");
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
        Optional<ForumPost> forumPost = forumPostRepository.findById(id);
        return forumPost.map(forumPostMapper::toDTO).orElse(null); // Nếu bài viết không tồn tại
    }
}
