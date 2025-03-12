package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Integer> {
}
