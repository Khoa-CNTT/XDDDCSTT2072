package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.ForumReactionDTO;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.ForumReaction;
import com.agricultural.agricultural.entity.ForumReply;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.ReactionType;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.ForumReactionMapper;
import com.agricultural.agricultural.repository.IForumPostRepository;
import com.agricultural.agricultural.repository.IForumReactionRepository;
import com.agricultural.agricultural.repository.IForumReplyRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IForumReactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForumReactionServiceImpl implements IForumReactionService {

    private final IForumReactionRepository forumReactionRepository;
    private final IForumPostRepository forumPostRepository;
    private final IForumReplyRepository forumReplyRepository;
    private final IUserRepository userRepository;
    private final ForumReactionMapper reactionMapper = ForumReactionMapper.INSTANCE;

    @Override
    @Transactional
    public ForumReactionDTO addPostReaction(Integer postId, Integer userId, ReactionType reactionType) {
        // Kiểm tra tồn tại của bài viết và người dùng
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        // Kiểm tra nếu người dùng đã thêm cảm xúc này cho bài viết
        Optional<ForumReaction> existingReaction = forumReactionRepository
                .findByPostIdAndUserIdAndReactionType(postId, userId, reactionType);
        
        if (existingReaction.isPresent()) {
            // Nếu đã tồn tại, trả về cảm xúc hiện có
            return reactionMapper.toDTO(existingReaction.get());
        }
        
        // Tạo cảm xúc mới
        ForumReaction reaction = ForumReaction.builder()
                .post(post)
                .user(user)
                .reactionType(reactionType)
                .build();
        
        ForumReaction savedReaction = forumReactionRepository.save(reaction);
        return reactionMapper.toDTO(savedReaction);
    }

    @Override
    @Transactional
    public ForumReactionDTO addReplyReaction(Integer replyId, Integer userId, ReactionType reactionType) {
        // Kiểm tra tồn tại của bình luận và người dùng
        ForumReply reply = forumReplyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + replyId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        // Kiểm tra nếu người dùng đã thêm cảm xúc này cho bình luận
        Optional<ForumReaction> existingReaction = forumReactionRepository
                .findByReplyIdAndUserIdAndReactionType(replyId, userId, reactionType);
        
        if (existingReaction.isPresent()) {
            // Nếu đã tồn tại, trả về cảm xúc hiện có
            return reactionMapper.toDTO(existingReaction.get());
        }
        
        // Tạo cảm xúc mới
        ForumReaction reaction = ForumReaction.builder()
                .reply(reply)
                .user(user)
                .reactionType(reactionType)
                .build();
        
        ForumReaction savedReaction = forumReactionRepository.save(reaction);
        return reactionMapper.toDTO(savedReaction);
    }

    @Override
    @Transactional
    public boolean removePostReaction(Integer postId, Integer userId, ReactionType reactionType) {
        // Tìm cảm xúc cần xóa
        Optional<ForumReaction> reactionOptional = forumReactionRepository
                .findByPostIdAndUserIdAndReactionType(postId, userId, reactionType);
        
        if (reactionOptional.isEmpty()) {
            return false; // Không tìm thấy cảm xúc để xóa
        }
        
        // Xóa cảm xúc
        forumReactionRepository.delete(reactionOptional.get());
        return true;
    }

    @Override
    @Transactional
    public boolean removeReplyReaction(Integer replyId, Integer userId, ReactionType reactionType) {
        // Tìm cảm xúc cần xóa
        Optional<ForumReaction> reactionOptional = forumReactionRepository
                .findByReplyIdAndUserIdAndReactionType(replyId, userId, reactionType);
        
        if (reactionOptional.isEmpty()) {
            return false; // Không tìm thấy cảm xúc để xóa
        }
        
        // Xóa cảm xúc
        forumReactionRepository.delete(reactionOptional.get());
        return true;
    }

    @Override
    public List<ForumReactionDTO> getReactionsByPostId(Integer postId) {
        return forumReactionRepository.findAllByPostId(postId).stream()
                .map(reactionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ForumReactionDTO> getReactionsByReplyId(Integer replyId) {
        return forumReactionRepository.findAllByReplyId(replyId).stream()
                .map(reactionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Integer> countReactionsByPostId(Integer postId) {
        List<Object[]> results = forumReactionRepository.countReactionsByPostIdGroupByType(postId);
        Map<String, Integer> countMap = new HashMap<>();
        
        // Chuyển đổi kết quả từ query thành map
        for (Object[] result : results) {
            ReactionType type = (ReactionType) result[0];
            Long count = (Long) result[1];
            countMap.put(type.name(), count.intValue());
        }
        
        // Thêm các loại reaction chưa có với giá trị 0
        for (ReactionType type : ReactionType.values()) {
            countMap.putIfAbsent(type.name(), 0);
        }
        
        return countMap;
    }

    @Override
    public Map<String, Integer> countReactionsByReplyId(Integer replyId) {
        List<Object[]> results = forumReactionRepository.countReactionsByReplyIdGroupByType(replyId);
        Map<String, Integer> countMap = new HashMap<>();
        
        // Chuyển đổi kết quả từ query thành map
        for (Object[] result : results) {
            ReactionType type = (ReactionType) result[0];
            Long count = (Long) result[1];
            countMap.put(type.name(), count.intValue());
        }
        
        // Thêm các loại reaction chưa có với giá trị 0
        for (ReactionType type : ReactionType.values()) {
            countMap.putIfAbsent(type.name(), 0);
        }
        
        return countMap;
    }

    @Override
    public List<ReactionType> getUserReactionsForPost(Integer postId, Integer userId) {
        List<ForumReaction> reactions = forumReactionRepository.findAllByPostIdAndUserId(postId, userId);
        return reactions.stream()
                .map(ForumReaction::getReactionType)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReactionType> getUserReactionsForReply(Integer replyId, Integer userId) {
        List<ForumReaction> reactions = forumReactionRepository.findAllByReplyIdAndUserId(replyId, userId);
        return reactions.stream()
                .map(ForumReaction::getReactionType)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ForumReactionDTO> getPostReactionUsers(Integer postId, ReactionType reactionType, Pageable pageable) {
        Page<ForumReaction> reactions = forumReactionRepository
                .findAllByPostIdAndReactionTypeWithUser(postId, reactionType, pageable);
        
        return reactions.map(reactionMapper::toDTO);
    }
} 