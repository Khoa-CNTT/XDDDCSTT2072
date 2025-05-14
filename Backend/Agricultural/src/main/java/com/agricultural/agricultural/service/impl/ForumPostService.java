package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.dto.ForumPostImageDTO;
import com.agricultural.agricultural.dto.request.ForumPostRequest;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.ForumPostImage;
import com.agricultural.agricultural.entity.Hashtag;
import com.agricultural.agricultural.entity.PostView;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.PrivacyLevel;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.IForumPostRepository;
import com.agricultural.agricultural.repository.IHashtagRepository;
import com.agricultural.agricultural.repository.IPostViewRepository;
import com.agricultural.agricultural.repository.IUserConnectionRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.ICloudinaryService;
import com.agricultural.agricultural.service.IForumPostImageService;
import com.agricultural.agricultural.service.IForumPostService;
import com.agricultural.agricultural.mapper.ForumPostMapper;
import com.agricultural.agricultural.mapper.ForumPostImageMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForumPostService implements IForumPostService {
    @Autowired
    private IForumPostRepository forumPostRepository;
    
    @Autowired
    private final UserRepository userRepository;
    
    @Autowired
    private final IForumPostImageService forumPostImageService;
    
    @Autowired
    private final IPostViewRepository postViewRepository;
    
    @Autowired
    private final IUserConnectionRepository userConnectionRepository;
    
    @Autowired
    private final IHashtagRepository hashtagRepository;
    
    @Autowired
    private final ICloudinaryService cloudinaryService;

    private final UserDetailsService userDetailsService;

    private final ForumPostMapper forumPostMapper = ForumPostMapper.INSTANCE; // Khởi tạo Mapper
    private final ForumPostImageMapper forumPostImageMapper = ForumPostImageMapper.INSTANCE; // Khởi tạo ForumPostImageMapper

    @Override
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
        
        // Xử lý thêm images nếu có
        ForumPostDTO createdPostDTO = forumPostMapper.toDTO(forumPost);
        
        // Nếu có ảnh trong DTO
        if (forumPostDto.getImages() != null && !forumPostDto.getImages().isEmpty()) {
            // Thêm ảnh vào bài viết
            try {
                for (ForumPostImageDTO imageDTO : forumPostDto.getImages()) {
                    // Đảm bảo có postId
                    imageDTO.setPostId(forumPost.getId());
                    // Dùng ForumPostImage service để lưu ảnh
                    ForumPostImage image = forumPostImageMapper.toEntity(imageDTO);
                    image.setPost(forumPost);
                    forumPost.addImage(image);
                }
                
                // Lưu lại bài viết với các ảnh
                forumPost = forumPostRepository.save(forumPost);
                
                // Cập nhật DTO với danh sách ảnh mới
                createdPostDTO = forumPostMapper.toDTO(forumPost);
            } catch (Exception e) {
                log.error("Lỗi khi lưu ảnh bài viết", e);
                // Vẫn trả về bài viết đã tạo, nhưng không có ảnh
            }
        }

        // Trả về DTO
        return createdPostDTO;
    }
    
    @Override
    @Transactional
    public ForumPostDTO createPostWithImages(ForumPostRequest request, List<MultipartFile> images) {
        // Tạo ForumPostDTO từ request
        ForumPostDTO forumPostDto = new ForumPostDTO();
        forumPostDto.setTitle(request.getTitle());
        forumPostDto.setContent(request.getContent());
        
        // Set các thuộc tính khác từ request
        forumPostDto.setPrivacyLevel(request.getPrivacyLevel() != null ? request.getPrivacyLevel() : PrivacyLevel.PUBLIC);
        forumPostDto.setLocation(request.getLocation());
        forumPostDto.setFeeling(request.getFeeling());
        forumPostDto.setBackgroundColor(request.getBackgroundColor());
        forumPostDto.setAttachmentType(request.getAttachmentType());
        forumPostDto.setAttachmentUrl(request.getAttachmentUrl());
        
        // Tạo bài viết cơ bản trước
        ForumPostDTO createdPost = createPost(forumPostDto);
        
        // Nếu có ảnh, lưu lại các ảnh
        if (images != null && !images.isEmpty()) {
            List<ForumPostImageDTO> imageList = new ArrayList<>();
            try {
                for (MultipartFile imageFile : images) {
                    // Sử dụng cloudinaryService để upload ảnh
                    String imageUrl = cloudinaryService.uploadImage(imageFile, "forum-posts/" + createdPost.getId());
                    
                    // Tạo đối tượng DTO
                    ForumPostImageDTO imageDTO = ForumPostImageDTO.builder()
                            .postId(createdPost.getId())
                            .imageUrl(imageUrl)
                            .build();
                    
                    // Lưu thông tin ảnh vào database
                    ForumPostImageDTO savedImage = forumPostImageService.addImageToPost(createdPost.getId(), imageDTO);
                    imageList.add(savedImage);
                }
                
                // Cập nhật DTO với danh sách ảnh
                createdPost.setImages(imageList);
            } catch (IOException e) {
                log.error("Lỗi khi lưu ảnh cho bài viết", e);
            }
        }
        
        // Xử lý hashtags nếu có
        if (request.getHashtags() != null && !request.getHashtags().isEmpty()) {
            for (String hashtagName : request.getHashtags()) {
                Optional<Hashtag> existingHashtag = hashtagRepository.findByName(hashtagName);
                Hashtag hashtag;
                
                if (existingHashtag.isPresent()) {
                    hashtag = existingHashtag.get();
                } else {
                    hashtag = Hashtag.builder()
                            .name(hashtagName)
                            .postCount(0)
                            .build();
                    hashtag = hashtagRepository.save(hashtag);
                }
                
                ForumPost post = forumPostRepository.findById(createdPost.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
                
                post.addHashtag(hashtag);
                forumPostRepository.save(post);
            }
            
            // Cập nhật lại DTO để trả về
            ForumPost updatedPost = forumPostRepository.findById(createdPost.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
            
            createdPost = forumPostMapper.toDTO(updatedPost);
        }
        
        return createdPost;
    }

    @Override
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
            throw new AccessDeniedException("Bạn không có quyền chỉnh sửa bài viết này");
        }

        forumPost.setTitle(forumPostDto.getTitle());
        forumPost.setContent(forumPostDto.getContent());
        
        // Cập nhật các trường khác nếu có
        if (forumPostDto.getPrivacyLevel() != null) {
            forumPost.setPrivacyLevel(forumPostDto.getPrivacyLevel());
        }
        if (forumPostDto.getLocation() != null) {
            forumPost.setLocation(forumPostDto.getLocation());
        }
        if (forumPostDto.getFeeling() != null) {
            forumPost.setFeeling(forumPostDto.getFeeling());
        }
        if (forumPostDto.getBackgroundColor() != null) {
            forumPost.setBackgroundColor(forumPostDto.getBackgroundColor());
        }
        if (forumPostDto.getAttachmentType() != null) {
            forumPost.setAttachmentType(forumPostDto.getAttachmentType());
        }
        if (forumPostDto.getAttachmentUrl() != null) {
            forumPost.setAttachmentUrl(forumPostDto.getAttachmentUrl());
        }
        
        // Đánh dấu bài viết đã chỉnh sửa
        forumPost.setIsEdited(true);
        forumPost.setEditedAt(new Timestamp(System.currentTimeMillis()));

        // Xử lý cập nhật ảnh nếu có
        if (forumPostDto.getImages() != null) {
            try {
                // Lấy tất cả ảnh cũ của bài viết
                List<ForumPostImageDTO> oldImages = forumPostImageService.getALlImagesByPost(id);
                
                // Xóa các ảnh cũ khỏi Cloudinary và database
                for (ForumPostImageDTO oldImage : oldImages) {
                    try {
                        // Trích xuất publicId từ URL
                        String publicId = cloudinaryService.extractPublicIdFromUrl(oldImage.getImageUrl());
                        if (publicId != null) {
                            // Xóa ảnh từ Cloudinary
                            cloudinaryService.deleteImage(publicId);
                        }
                    } catch (Exception e) {
                        log.error("Lỗi khi xóa ảnh cũ từ Cloudinary", e);
                    }
                    
                    // Xóa ảnh từ database
                    forumPostImageService.deleteImage(oldImage.getId());
                }
                
                // Thêm ảnh mới nếu có
                if (!forumPostDto.getImages().isEmpty()) {
                    for (ForumPostImageDTO imageDTO : forumPostDto.getImages()) {
                        forumPostImageService.addImageToPost(id, imageDTO);
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi khi cập nhật ảnh bài viết", e);
                // Vẫn tiếp tục cập nhật bài viết, không cập nhật ảnh
            }
        }

        forumPost = forumPostRepository.save(forumPost);

        // 📌 5. Trả về DTO đã cập nhật
        return forumPostMapper.toDTO(forumPost);
    }

    @Override
    public void deletePost(int id) {
        if (!forumPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id);
        }
        
        // Xóa tất cả ảnh của bài viết trước
        try {
            List<ForumPostImageDTO> images = forumPostImageService.getALlImagesByPost(id);
            for (ForumPostImageDTO image : images) {
                try {
                    // Trích xuất publicId từ URL
                    String publicId = cloudinaryService.extractPublicIdFromUrl(image.getImageUrl());
                    if (publicId != null) {
                        // Xóa ảnh từ Cloudinary
                        cloudinaryService.deleteImage(publicId);
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi xóa ảnh từ Cloudinary", e);
                }
                
                // Xóa ảnh từ database
                forumPostImageService.deleteImage(image.getId());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa ảnh của bài viết", e);
            // Vẫn tiếp tục xóa bài viết
        }
        
        forumPostRepository.deleteById(id);
    }

    @Override
    public List<ForumPostDTO> getAllPosts() {
        List<ForumPost> forumPosts = forumPostRepository.findAll();
        return forumPosts.stream()
                .map(forumPostMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ForumPostDTO getPostById(int id) {
        return forumPostRepository.findById(id)
                .map(forumPostMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id));
    }
    
    @Override
    public Page<ForumPostDTO> getPosts(Pageable pageable) {
        return forumPostRepository.findAll(pageable)
                .map(forumPostMapper::toDTO);
    }
    
    @Override
    public Page<ForumPostDTO> getPostsByUserId(Integer userId, Pageable pageable) {
        return forumPostRepository.findAllByUserId(userId, pageable)
                .map(forumPostMapper::toDTO);
    }
    
    @Override
    public Page<ForumPostDTO> getPostsByPrivacyLevel(PrivacyLevel privacyLevel, Pageable pageable) {
        return forumPostRepository.findAllByPrivacyLevel(privacyLevel, pageable)
                .map(forumPostMapper::toDTO);
    }
    
    @Override
    public Page<ForumPostDTO> getPostsByHashtag(String hashtag, Pageable pageable) {
        // Đảm bảo hashtag theo định dạng chuẩn
        if (!hashtag.startsWith("#")) {
            hashtag = "#" + hashtag;
        }
        
        return forumPostRepository.findAllByHashtagName(hashtag, pageable)
                .map(forumPostMapper::toDTO);
    }
    
    @Override
    @Transactional
    public void incrementViewCount(Integer postId, Integer userId) {
        // Kiểm tra bài viết tồn tại
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));
        
        // Kiểm tra xem người dùng này đã xem bài viết chưa
        boolean hasViewed = postViewRepository.existsByPostIdAndUserId(postId, userId);
        
        if (!hasViewed) {
            // Nếu chưa xem, lưu thông tin xem và tăng lượt xem
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
            
            PostView postView = PostView.builder()
                    .post(post)
                    .user(user)
                    .viewDate(LocalDateTime.now())
                    .build();
            
            postViewRepository.save(postView);
            
            // Tăng số lượt xem trong bài viết
            post.incrementViewCount();
            forumPostRepository.save(post);
        }
    }
    
    @Override
    @Transactional
    public ForumPostDTO pinPost(Integer postId) throws AccessDeniedException {
        // Kiểm tra quyền người dùng (chỉ chủ bài viết hoặc admin có thể ghim)
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));
        
        // Kiểm tra quyền
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!post.getUser().getUsername().equals(currentUsername) && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền ghim bài viết này");
        }
        
        // Ghim bài viết
        forumPostRepository.pinPost(postId);
        
        return forumPostRepository.findById(postId)
                .map(forumPostMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));
    }
    
    @Override
    @Transactional
    public ForumPostDTO unpinPost(Integer postId) throws AccessDeniedException {
        // Kiểm tra quyền người dùng (chỉ chủ bài viết hoặc admin có thể bỏ ghim)
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));
        
        // Kiểm tra quyền
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!post.getUser().getUsername().equals(currentUsername) && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền bỏ ghim bài viết này");
        }
        
        // Bỏ ghim bài viết
        forumPostRepository.unpinPost(postId);
        
        return forumPostRepository.findById(postId)
                .map(forumPostMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));
    }
    
    @Override
    @Transactional
    public ForumPostDTO sharePost(Integer originalPostId, String content) {
        // Lấy thông tin bài viết gốc
        ForumPost originalPost = forumPostRepository.findById(originalPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết gốc với ID: " + originalPostId));
        
        // Lấy thông tin người dùng hiện tại
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng"));
        
        // Tạo bài viết chia sẻ
        ForumPost sharedPost = new ForumPost();
        sharedPost.setUser(user);
        sharedPost.setTitle("Đã chia sẻ: " + originalPost.getTitle());
        sharedPost.setContent(content != null ? content : "");
        sharedPost.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        sharedPost.setIsShared(true);
        sharedPost.setOriginalPost(originalPost);
        
        // Lưu bài viết chia sẻ
        ForumPost savedPost = forumPostRepository.save(sharedPost);
        
        return forumPostMapper.toDTO(savedPost);
    }
    
    @Override
    public Page<ForumPostDTO> searchPosts(String keyword, Pageable pageable) {
        Page<ForumPost> posts = forumPostRepository.searchByTitleOrContent(keyword, pageable);
        return posts.map(forumPostMapper::toDTO);
    }
    
    @Override
    public Page<ForumPostDTO> getPostsFromConnections(Integer userId, Pageable pageable) {
        // Lấy danh sách ID người dùng đã kết nối
        List<Integer> connectedUserIds = userConnectionRepository.findConnectedUserIds(userId);
        
        // Thêm ID của người dùng hiện tại để hiển thị cả bài viết của họ
        connectedUserIds.add(userId);
        
        // Lấy bài viết từ những người đã kết nối và bài viết công khai
        Page<ForumPost> posts = forumPostRepository.findPostsVisibleToUser(userId, connectedUserIds, pageable);
        
        return posts.map(forumPostMapper::toDTO);
    }
}
