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

        // Tạo reply mới
        ForumReply reply = ForumReply.builder()
                .content(request.getContent())
                .post(post)
                .user(user)
                .likeCount(0)
                .isDeleted(false)
                .build();

        // Nếu là reply con (có parentId)
        if (request.getParentId() != null) {
            ForumReply parentReply = replyRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận cha với ID: " + request.getParentId()));
            reply.setParent(parentReply);
        }

        // Lưu reply vào database
        ForumReply savedReply = replyRepository.save(reply);

        // Trả về DTO
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
        
        // Lấy reply từ database
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));

        if (reply.getUser() == null || reply.getUser().getId() != userId) {
            throw new BadRequestException("Bạn không có quyền cập nhật bình luận này");
        }


        // Cập nhật nội dung bình luận
        reply.setContent(content);

        // Lưu vào database
        ForumReply updatedReply = replyRepository.save(reply);

        // Trả về DTO
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
        
        // Lấy reply từ database
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));

        if (reply.getUser() == null || reply.getUser().getId() != userId) {
            throw new BadRequestException("Bạn không có quyền xoá bình luận này");
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
        
        // Lấy reply từ database
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));

        // Tăng số lượt thích (trong thực tế, nên có bảng riêng để lưu thông tin thích)
        reply.setLikeCount(reply.getLikeCount() + 1);
        
        // Lưu vào database
        ForumReply updatedReply = replyRepository.save(reply);

        // Trả về DTO
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
        
        // Lấy reply từ database
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));

        // Giảm số lượt thích (nếu > 0)
        if (reply.getLikeCount() > 0) {
            reply.setLikeCount(reply.getLikeCount() - 1);
        }
        
        // Lưu vào database
        ForumReply updatedReply = replyRepository.save(reply);

        // Trả về DTO
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