package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.FeedbackDTO;
import com.agricultural.agricultural.entity.enumeration.FeedbackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IFeedbackService {
    
    FeedbackDTO convertJsonToFeedbackDTO(String feedbackJson) throws Exception;
    
    FeedbackDTO createFeedback(FeedbackDTO feedbackDTO, List<MultipartFile> images);
    
    FeedbackDTO updateFeedback(Integer id, FeedbackDTO feedbackDTO, List<MultipartFile> images);
    
    void deleteFeedback(Integer id);
    
    FeedbackDTO getFeedbackById(Integer id);
    
    Page<FeedbackDTO> getFeedbacksByProductId(Integer productId, Pageable pageable);
    
    Page<FeedbackDTO> getFeedbacksByUserId(Integer userId, Pageable pageable);
    
    Map<String, Object> getFeedbackStatsByProductId(Integer productId);
    
    FeedbackDTO updateFeedbackStatus(Integer id, FeedbackStatus status);
    
    FeedbackDTO addReplyToFeedback(Integer id, String reply);
    
    FeedbackDTO markFeedbackAsHelpful(Integer id);
    
    FeedbackDTO markFeedbackAsNotHelpful(Integer id);
    
    Page<FeedbackDTO> getPendingFeedbacks(Pageable pageable);
    
    List<FeedbackDTO> getHighestRatedFeedbacks(Integer productId, Integer limit);
    
    List<FeedbackDTO> getLowestRatedFeedbacks(Integer productId, Integer limit);
    
    Page<FeedbackDTO> getFeedbacksByMinRating(Integer productId, Integer minRating, Pageable pageable);
    
    Page<FeedbackDTO> getVerifiedPurchaseFeedbacks(Integer productId, Pageable pageable);
    

    boolean userHasReviewedProduct(Integer userId, Integer productId);
    

    boolean userHasPurchasedProduct(Integer userId, Integer productId);
    

    List<Map<String, Object>> getUnreviewedProducts(Integer userId);
} 