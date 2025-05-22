package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Hashtag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IHashtagRepository extends JpaRepository<Hashtag, Integer> {
    

    Optional<Hashtag> findByName(String name);
    

    List<Hashtag> findByNameContainingIgnoreCase(String name);
    

    Page<Hashtag> findAllByOrderByPostCountDesc(Pageable pageable);
    

    @Query("SELECT h FROM Hashtag h JOIN h.posts p WHERE p.id = :postId")
    List<Hashtag> findAllByPostId(@Param("postId") Integer postId);
    

    @Query("SELECT h FROM Hashtag h JOIN h.posts p WHERE p.id = :postId AND h.id = :hashtagId")
    Optional<Hashtag> findByPostIdAndHashtagId(@Param("postId") Integer postId, @Param("hashtagId") Integer hashtagId);
} 