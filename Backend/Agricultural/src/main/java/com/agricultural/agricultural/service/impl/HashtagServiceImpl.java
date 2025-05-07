package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.HashtagDTO;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.Hashtag;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.HashtagMapper;
import com.agricultural.agricultural.repository.IForumPostRepository;
import com.agricultural.agricultural.repository.IHashtagRepository;
import com.agricultural.agricultural.service.IHashtagService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HashtagServiceImpl implements IHashtagService {

    private final IHashtagRepository hashtagRepository;
    private final IForumPostRepository forumPostRepository;
    private final HashtagMapper hashtagMapper = HashtagMapper.INSTANCE;

    @Override
    public HashtagDTO createHashtag(String name) {
        // Kiểm tra nếu hashtag đã tồn tại
        if (hashtagRepository.findByName(name).isPresent()) {
            log.info("Hashtag với tên {} đã tồn tại", name);
            return hashtagRepository.findByName(name)
                    .map(hashtagMapper::toDTO)
                    .orElse(null);
        }

        // Xử lý tên hashtag (loại bỏ khoảng trắng, chuyển thành lowercase)
        String processedName = name.trim().toLowerCase().replaceAll("\\s+", "");
        if (!processedName.startsWith("#")) {
            processedName = "#" + processedName;
        }

        // Tạo và lưu hashtag mới
        Hashtag hashtag = Hashtag.builder()
                .name(processedName)
                .postCount(0)
                .build();

        return hashtagMapper.toDTO(hashtagRepository.save(hashtag));
    }

    @Override
    public HashtagDTO findOrCreateHashtag(String name) {
        return hashtagRepository.findByName(name)
                .map(hashtagMapper::toDTO)
                .orElseGet(() -> createHashtag(name));
    }

    @Override
    public List<HashtagDTO> findHashtagsByNameContaining(String name) {
        return hashtagRepository.findByNameContainingIgnoreCase(name).stream()
                .map(hashtagMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HashtagDTO findHashtagByName(String name) {
        return hashtagRepository.findByName(name)
                .map(hashtagMapper::toDTO)
                .orElse(null);
    }

    @Override
    @Transactional
    public Set<HashtagDTO> addHashtagsToPost(Integer postId, List<String> hashtagNames) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        Set<Hashtag> hashtags = new HashSet<>();

        for (String name : hashtagNames) {
            // Xử lý tên hashtag
            final String processedName = name.trim().toLowerCase().replaceAll("\\s+", "");
            final String finalProcessedName = !processedName.startsWith("#") ? "#" + processedName : processedName;

            // Tìm hoặc tạo hashtag
            Hashtag hashtag = hashtagRepository.findByName(finalProcessedName)
                    .orElseGet(() -> {
                        Hashtag newHashtag = Hashtag.builder()
                                .name(finalProcessedName)
                                .postCount(0)
                                .build();
                        return hashtagRepository.save(newHashtag);
                    });

            // Thêm hashtag vào bài viết
            post.addHashtag(hashtag);
            hashtags.add(hashtag);
        }

        // Lưu bài viết để cập nhật liên kết
        forumPostRepository.save(post);

        return hashtags.stream()
                .map(hashtagMapper::toDTO)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public void removeHashtagFromPost(Integer postId, Integer hashtagId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        Hashtag hashtag = hashtagRepository.findById(hashtagId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hashtag với ID: " + hashtagId));

        post.removeHashtag(hashtag);
        forumPostRepository.save(post);
    }

    @Override
    public Page<HashtagDTO> getTrendingHashtags(Pageable pageable) {
        return hashtagRepository.findAllByOrderByPostCountDesc(pageable)
                .map(hashtagMapper::toDTO);
    }

    @Override
    public List<HashtagDTO> getHashtagsByPostId(Integer postId) {
        return hashtagRepository.findAllByPostId(postId).stream()
                .map(hashtagMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updatePostCount(Integer hashtagId) {
        Hashtag hashtag = hashtagRepository.findById(hashtagId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hashtag với ID: " + hashtagId));

        // Tính lại số lượng bài viết thực tế
        int count = hashtag.getPosts().size();
        hashtag.setPostCount(count);

        hashtagRepository.save(hashtag);
    }
} 