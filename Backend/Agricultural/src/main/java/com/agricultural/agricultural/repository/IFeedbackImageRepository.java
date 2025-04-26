package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.FeedbackImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IFeedbackImageRepository extends JpaRepository<FeedbackImage, Integer> {
    
    List<FeedbackImage> findByFeedbackIdOrderByDisplayOrderAsc(Integer feedbackId);
    
    void deleteByFeedbackId(Integer feedbackId);
} 