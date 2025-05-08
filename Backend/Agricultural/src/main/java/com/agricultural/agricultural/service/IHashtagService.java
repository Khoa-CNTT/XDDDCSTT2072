package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.HashtagDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

/**
 * Service interface cho quản lý hashtag
 */
public interface IHashtagService {
    
    /**
     * Tạo mới một hashtag
     * @param name Tên hashtag
     * @return Hashtag đã tạo
     */
    HashtagDTO createHashtag(String name);
    
    /**
     * Tìm hashtag theo tên, nếu chưa tồn tại thì tạo mới
     * @param name Tên hashtag
     * @return HashtagDTO
     */
    HashtagDTO findOrCreateHashtag(String name);
    
    /**
     * Tìm kiếm hashtag theo một phần tên
     * @param name Tên hashtag (một phần)
     * @return Danh sách hashtag phù hợp
     */
    List<HashtagDTO> findHashtagsByNameContaining(String name);
    
    /**
     * Tìm kiếm hashtag theo tên chính xác
     * @param name Tên hashtag
     * @return Hashtag (hoặc null nếu không tồn tại)
     */
    HashtagDTO findHashtagByName(String name);
    
    /**
     * Liên kết nhiều hashtag với một bài viết
     * @param postId ID bài viết
     * @param hashtagNames Danh sách tên hashtag
     * @return Set các hashtag đã liên kết
     */
    Set<HashtagDTO> addHashtagsToPost(Integer postId, List<String> hashtagNames);
    
    /**
     * Xóa liên kết của một hashtag khỏi bài viết
     * @param postId ID bài viết
     * @param hashtagId ID hashtag
     */
    void removeHashtagFromPost(Integer postId, Integer hashtagId);
    
    /**
     * Lấy danh sách tất cả hashtag phổ biến
     * @param pageable Thông tin phân trang
     * @return Danh sách hashtag
     */
    Page<HashtagDTO> getTrendingHashtags(Pageable pageable);
    
    /**
     * Lấy danh sách hashtag của một bài viết
     * @param postId ID bài viết
     * @return Danh sách hashtag
     */
    List<HashtagDTO> getHashtagsByPostId(Integer postId);
    
    /**
     * Cập nhật số lượng bài viết của hashtag
     * @param hashtagId ID hashtag
     */
    void updatePostCount(Integer hashtagId);
} 