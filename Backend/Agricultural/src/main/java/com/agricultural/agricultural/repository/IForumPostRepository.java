package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IForumPostRepository extends JpaRepository<ForumPost, Integer> {
}
