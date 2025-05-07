package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.enumeration.PrivacyLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface IForumPostRepository extends JpaRepository<ForumPost, Integer> {
    
    /**
     * Tìm bài viết theo người dùng
     */
    Page<ForumPost> findAllByUserId(Integer userId, Pageable pageable);
    
    /**
     * Tìm bài viết theo mức độ riêng tư
     */
    Page<ForumPost> findAllByPrivacyLevel(PrivacyLevel privacyLevel, Pageable pageable);
    
    /**
     * Tìm bài viết theo hashtag
     */
    @Query("SELECT p FROM ForumPost p JOIN p.hashtags h WHERE h.name = :hashtag")
    Page<ForumPost> findAllByHashtagName(@Param("hashtag") String hashtag, Pageable pageable);
    
    /**
     * Tìm kiếm bài viết theo từ khóa trong tiêu đề hoặc nội dung
     */
    @Query("SELECT p FROM ForumPost p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    Page<ForumPost> searchByTitleOrContent(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Lấy bài viết được ghim
     */
    Page<ForumPost> findAllByIsPinnedTrue(Pageable pageable);
    
    /**
     * Lấy bài viết là chia sẻ từ bài viết gốc
     */
    Page<ForumPost> findAllByOriginalPostId(Integer originalPostId, Pageable pageable);
    
    /**
     * Lấy bài viết của người dùng và người dùng đã kết nối
     */
    @Query("SELECT p FROM ForumPost p WHERE p.user.id = :userId OR " +
           "(p.privacyLevel = 'PUBLIC') OR " +
           "(p.privacyLevel = 'CONNECTIONS' AND p.user.id IN :connectedUserIds)")
    Page<ForumPost> findPostsVisibleToUser(
            @Param("userId") Integer userId, 
            @Param("connectedUserIds") List<Integer> connectedUserIds, 
            Pageable pageable);
    
    /**
     * Cập nhật lượt xem của bài viết
     */
    @Modifying
    @Query("UPDATE ForumPost p SET p.viewCount = p.viewCount + 1 WHERE p.id = :postId")
    void incrementViewCount(@Param("postId") Integer postId);
    
    /**
     * Ghim bài viết
     */
    @Modifying
    @Query("UPDATE ForumPost p SET p.isPinned = true WHERE p.id = :postId")
    void pinPost(@Param("postId") Integer postId);
    
    /**
     * Bỏ ghim bài viết
     */
    @Modifying
    @Query("UPDATE ForumPost p SET p.isPinned = false WHERE p.id = :postId")
    void unpinPost(@Param("postId") Integer postId);
    
    /**
     * Đánh dấu bài viết đã được chỉnh sửa
     */
    @Modifying
    @Query("UPDATE ForumPost p SET p.isEdited = true, p.editedAt = :editedAt WHERE p.id = :postId")
    void markAsEdited(@Param("postId") Integer postId, @Param("editedAt") Timestamp editedAt);
}
