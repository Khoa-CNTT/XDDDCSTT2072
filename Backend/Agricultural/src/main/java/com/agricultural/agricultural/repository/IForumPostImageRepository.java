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
    

    List<ForumPostImage> findAllByPostId(Integer postId);
    

    List<ForumPostImage> findAllByPostIdOrderByDisplayOrderAsc(Integer postId);

    @Modifying
    @Query("DELETE FROM ForumPostImage i WHERE i.post.id = :postId")
    void deleteAllByPostId(@Param("postId") Integer postId);

    Integer findMaxDisplayOrderByPostId(Integer postId);

    List<ForumPostImage> findByPostIdOrderByDisplayOrderAsc(Integer postId);

    void deleteByPostId(Integer postId);
}