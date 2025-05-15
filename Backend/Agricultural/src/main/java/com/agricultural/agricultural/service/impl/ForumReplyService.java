package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ForumReplyDTO;
import com.agricultural.agricultural.dto.request.ForumReplyRequest;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.ForumReply;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.ForumReplyMapper;
import com.agricultural.agricultural.repository.IForumPostRepository;
import com.agricultural.agricultural.repository.IForumReplyRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IForumReplyService;
import com.agricultural.agricultural.service.INotificationService;
import com.agricultural.agricultural.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumReplyService implements IForumReplyService {

    private final IForumReplyRepository replyRepository;
    private final IForumPostRepository postRepository;
    private final IUserRepository userRepository;
    private final ForumReplyMapper replyMapper;
    private final INotificationService notificationService;
    private final ProfanityFilterService profanityFilterService;

    @Override
    public List<ForumReplyDTO> getRootRepliesByPostId(Integer postId) {
        if (postId == null) {
            throw new BadRequestException("ID bài viết không được để trống");
        }
        
        List<ForumReply> rootReplies = replyRepository.findRootRepliesByPostId(postId);
        return rootReplies.stream()
                .map(replyMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ForumReplyDTO> getRootRepliesByPostId(Integer postId, Pageable pageable) {
        if (postId == null) {
            throw new BadRequestException("ID bài viết không được để trống");
        }
        
        if (pageable == null) {
            throw new BadRequestException("Thông tin phân trang không được để trống");
        }
        
        Page<ForumReply> rootRepliesPage = replyRepository.findRootRepliesByPostId(postId, pageable);
        return rootRepliesPage.map(replyMapper::toDTO);
    }

    @Override
    public List<ForumReplyDTO> getRepliesByParentId(Integer parentId) {
        if (parentId == null) {
            throw new BadRequestException("ID bình luận cha không được để trống");
        }
        
        List<ForumReply> childReplies = replyRepository.findRepliesByParentId(parentId);
        return childReplies.stream()
                .map(replyMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ForumReplyDTO> getRepliesByParentId(Integer parentId, Pageable pageable) {
        if (parentId == null) {
            throw new BadRequestException("ID bình luận cha không được để trống");
        }
        
        if (pageable == null) {
            throw new BadRequestException("Thông tin phân trang không được để trống");
        }
        
        Page<ForumReply> childRepliesPage = replyRepository.findRepliesByParentId(parentId, pageable);
        return childRepliesPage.map(replyMapper::toDTO);
    }

    @Override
    @Transactional
    public ForumReplyDTO createReply(ForumReplyRequest request, Integer userId) {
        if (request == null) {
            throw new BadRequestException("Thông tin bình luận không được để trống");
        }
        
        if (request.getPostId() == null) {
            throw new BadRequestException("ID bài viết không được để trống");
        }
        
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BadRequestException("Nội dung bình luận không được để trống");
        }
        
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        // Lấy user từ database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // Lấy bài viết từ database
        ForumPost post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + request.getPostId()));

        // Kiểm tra nội dung có chứa từ ngữ không phù hợp không
        boolean containsProfanity = profanityFilterService.containsProfanity(request.getContent());
        
        // Lọc nội dung bình luận nếu có từ ngữ tục tĩu
        String filteredContent = profanityFilterService.filterProfanity(request.getContent());
        
        // Tạo reply mới
        ForumReply reply = ForumReply.builder()
                .content(filteredContent)
                .post(post)
                .user(user)
                .isInappropriate(containsProfanity)
                .build();

        // Nếu có parentId, tức là reply cho một comment
        if (request.getParentId() != null) {
            ForumReply parentReply = replyRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận cha với ID: " + request.getParentId()));
            reply.setParent(parentReply);
            
            // Gửi thông báo cho người bình luận gốc nếu đó không phải là người đang reply
            if (parentReply.getUser().getId() != userId) {
                // Tạo thông báo về reply
                NotificationDTO notification = NotificationDTO.builder()
                        .receiverId(parentReply.getUser().getId())
                        .senderId(userId)
                        .type("REPLY")
                        .title("Phản hồi mới")
                        .content("đã trả lời bình luận của bạn trong bài viết \"" + post.getTitle() + "\"")
                        .entityId(reply.getId())
                        .entityType("FORUM_REPLY")
                        .relatedEntityId(post.getId())
                        .relatedEntityType("FORUM_POST")
                        .build();
                
                // Gửi thông báo
                notificationService.createNotification(notification);
            }
        } else {
            // Đây là bình luận gốc (không phải reply), gửi thông báo cho chủ bài viết nếu cần
            if (post.getUser().getId() != userId) {
                // Tạo thông báo về bình luận mới
                NotificationDTO notification = NotificationDTO.builder()
                        .receiverId(post.getUser().getId())
                        .senderId(userId)
                        .type("COMMENT")
                        .title("Bình luận mới")
                        .content("đã bình luận về bài viết của bạn \"" + post.getTitle() + "\"")
                        .entityId(reply.getId())
                        .entityType("FORUM_REPLY")
                        .relatedEntityId(post.getId())
                        .relatedEntityType("FORUM_POST")
                        .build();
                
                // Gửi thông báo
                notificationService.createNotification(notification);
            }
        }

        ForumReply savedReply = replyRepository.save(reply);
        return replyMapper.toDTO(savedReply);
    }

    @Override
    @Transactional
    public ForumReplyDTO updateReply(Integer replyId, String content, Integer userId) {
        if (replyId == null) {
            throw new BadRequestException("ID bình luận không được để trống");
        }
        
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Nội dung bình luận không được để trống");
        }
        
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));
        
        // Kiểm tra quyền
        if (reply.getUser().getId() != userId) {
            throw new BadRequestException("Bạn không có quyền sửa bình luận này");
        }
        
        // Kiểm tra nội dung có chứa từ ngữ không phù hợp không
        boolean containsProfanity = profanityFilterService.containsProfanity(content);
        
        // Lọc nội dung bình luận nếu có từ ngữ tục tĩu
        String filteredContent = profanityFilterService.filterProfanity(content);
        
        reply.setContent(filteredContent);
        reply.setIsInappropriate(containsProfanity);
        
        ForumReply updatedReply = replyRepository.save(reply);
        return replyMapper.toDTO(updatedReply);
    }

    @Override
    @Transactional
    public void deleteReply(Integer replyId, Integer userId) {
        if (replyId == null) {
            throw new BadRequestException("ID bình luận không được để trống");
        }
        
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));
        
        // Kiểm tra quyền (chỉ chủ bình luận mới được xóa)
        if (reply.getUser().getId() != userId) {
            throw new BadRequestException("Bạn không có quyền xóa bình luận này");
        }
        
        // Xóa mềm bình luận
        reply.setIsDeleted(true);
        replyRepository.save(reply);
    }

    @Override
    @Transactional
    public ForumReplyDTO likeReply(Integer replyId, Integer userId) {
        if (replyId == null) {
            throw new BadRequestException("ID bình luận không được để trống");
        }
        
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));
        
        // Kiểm tra nếu bình luận đã bị xóa
        if (Boolean.TRUE.equals(reply.getIsDeleted())) {
            throw new BadRequestException("Bình luận này đã bị xóa");
        }
        
        // Tăng số lượt thích
        reply.incrementLikes();
        ForumReply updatedReply = replyRepository.save(reply);
        
        // Gửi thông báo nếu người like không phải chủ bình luận
        if (reply.getUser().getId() != userId) {
            // Tạo thông báo về like
            NotificationDTO notification = NotificationDTO.builder()
                    .receiverId(reply.getUser().getId())
                    .senderId(userId)
                    .type("LIKE_COMMENT")
                    .title("Lượt thích mới")
                    .content("đã thích bình luận của bạn")
                    .entityId(replyId)
                    .entityType("FORUM_REPLY")
                    .relatedEntityId(reply.getPost().getId())
                    .relatedEntityType("FORUM_POST")
                    .build();
            
            // Gửi thông báo
            notificationService.createNotification(notification);
        }
        
        return replyMapper.toDTO(updatedReply);
    }

    @Override
    @Transactional
    public ForumReplyDTO unlikeReply(Integer replyId, Integer userId) {
        if (replyId == null) {
            throw new BadRequestException("ID bình luận không được để trống");
        }
        
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));
        
        // Kiểm tra nếu bình luận đã bị xóa
        if (Boolean.TRUE.equals(reply.getIsDeleted())) {
            throw new BadRequestException("Bình luận này đã bị xóa");
        }
        
        // Giảm số lượt thích
        reply.decrementLikes();
        ForumReply updatedReply = replyRepository.save(reply);
        
        return replyMapper.toDTO(updatedReply);
    }

    @Override
    public Long countRootRepliesByPostId(Integer postId) {
        if (postId == null) {
            throw new BadRequestException("ID bài viết không được để trống");
        }
        
        return replyRepository.countRootRepliesByPostId(postId);
    }

    @Override
    public Long countAllRepliesByPostId(Integer postId) {
        if (postId == null) {
            throw new BadRequestException("ID bài viết không được để trống");
        }
        
        return replyRepository.countAllRepliesByPostId(postId);
    }
} 