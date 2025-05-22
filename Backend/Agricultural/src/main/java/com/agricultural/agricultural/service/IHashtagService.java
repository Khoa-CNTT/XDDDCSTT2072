package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.HashtagDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;


public interface IHashtagService {
    

    HashtagDTO createHashtag(String name);
    

    HashtagDTO findOrCreateHashtag(String name);

    List<HashtagDTO> findHashtagsByNameContaining(String name);
    

    HashtagDTO findHashtagByName(String name);

    Set<HashtagDTO> addHashtagsToPost(Integer postId, List<String> hashtagNames);
    

    void removeHashtagFromPost(Integer postId, Integer hashtagId);
    

    Page<HashtagDTO> getTrendingHashtags(Pageable pageable);

    List<HashtagDTO> getHashtagsByPostId(Integer postId);
    

    void updatePostCount(Integer hashtagId);
} 