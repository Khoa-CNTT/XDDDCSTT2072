package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.FeedbackDTO;
import com.agricultural.agricultural.entity.enumeration.FeedbackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IFeedbackService {
    
    // Phương thức mới để xử lý chuyển đổi JSON string thành FeedbackDTO
    FeedbackDTO convertJsonToFeedbackDTO(String feedbackJson) throws Exception;
    
    // Thêm đánh giá mới
    FeedbackDTO createFeedback(FeedbackDTO feedbackDTO, List<MultipartFile> images);
    
    // Cập nhật đánh giá
    FeedbackDTO updateFeedback(Integer id, FeedbackDTO feedbackDTO, List<MultipartFile> images);
    
    // Xóa đánh giá
    void deleteFeedback(Integer id);
    
    // Lấy đánh giá theo ID
    FeedbackDTO getFeedbackById(Integer id);
    
    // Lấy danh sách đánh giá theo sản phẩm
    Page<FeedbackDTO> getFeedbacksByProductId(Integer productId, Pageable pageable);
    
    // Lấy danh sách đánh giá theo người dùng
    Page<FeedbackDTO> getFeedbacksByUserId(Integer userId, Pageable pageable);
    
    // Lấy thống kê đánh giá theo sản phẩm
    Map<String, Object> getFeedbackStatsByProductId(Integer productId);
    
    // Thay đổi trạng thái đánh giá
    FeedbackDTO updateFeedbackStatus(Integer id, FeedbackStatus status);
    
    // Thêm phản hồi vào đánh giá
    FeedbackDTO addReplyToFeedback(Integer id, String reply);
    
    // Đánh dấu đánh giá là hữu ích
    FeedbackDTO markFeedbackAsHelpful(Integer id);
    
    // Đánh dấu đánh giá là không hữu ích
    FeedbackDTO markFeedbackAsNotHelpful(Integer id);
    
    // Lấy tất cả đánh giá đang chờ duyệt
    Page<FeedbackDTO> getPendingFeedbacks(Pageable pageable);
    
    // Lấy đánh giá có rating cao nhất
    List<FeedbackDTO> getHighestRatedFeedbacks(Integer productId, Integer limit);
    
    // Lấy đánh giá có rating thấp nhất
    List<FeedbackDTO> getLowestRatedFeedbacks(Integer productId, Integer limit);
    
    // Lấy đánh giá theo rating tối thiểu
    Page<FeedbackDTO> getFeedbacksByMinRating(Integer productId, Integer minRating, Pageable pageable);
    
    // Lấy đánh giá từ khách hàng đã mua hàng
    Page<FeedbackDTO> getVerifiedPurchaseFeedbacks(Integer productId, Pageable pageable);
} 