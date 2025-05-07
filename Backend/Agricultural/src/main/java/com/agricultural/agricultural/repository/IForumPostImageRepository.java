package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumPostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IForumPostImageRepository extends JpaRepository<ForumPostImage, Integer> {
    
    /**
     * Tìm tất cả ảnh của một bài viết
     */
    List<ForumPostImage> findAllByPostId(Integer postId);
    
    /**
     * Tìm tất cả ảnh của một bài viết sắp xếp theo thứ tự hiển thị
     */
    List<ForumPostImage> findAllByPostIdOrderByDisplayOrderAsc(Integer postId);
    
    /**
     * Xóa tất cả ảnh của một bài viết
     */
    @Modifying
    @Query("DELETE FROM ForumPostImage i WHERE i.post.id = :postId")
    void deleteAllByPostId(@Param("postId") Integer postId);

    Integer findMaxDisplayOrderByPostId(Integer postId);

    List<ForumPostImage> findByPostIdOrderByDisplayOrderAsc(Integer postId);

    void deleteByPostId(Integer postId);
}