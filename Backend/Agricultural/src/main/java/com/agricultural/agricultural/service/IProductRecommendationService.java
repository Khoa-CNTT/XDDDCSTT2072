package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface cho hệ thống gợi ý sản phẩm nông sản
 */
public interface IProductRecommendationService {

    /**
     * Lấy danh sách nông sản gợi ý cho người dùng dựa trên lịch sử mua hàng
     * và hành vi duyệt web của họ
     * 
     * @param userId ID của người dùng
     * @param pageable Thông tin phân trang
     * @return Danh sách nông sản được gợi ý
     */
    Page<MarketPlaceDTO> getPersonalizedRecommendations(Integer userId, Pageable pageable);
    
    /**
     * Lấy danh sách nông sản tương tự với một sản phẩm cụ thể
     * 
     * @param marketplaceId ID của sản phẩm nông sản
     * @param pageable Thông tin phân trang
     * @return Danh sách nông sản tương tự
     */
    Page<MarketPlaceDTO> getSimilarProducts(Integer marketplaceId, Pageable pageable);
    
    /**
     * Lấy danh sách nông sản thường được mua cùng với sản phẩm hiện tại
     * 
     * @param marketplaceId ID của sản phẩm nông sản
     * @param limit Số lượng sản phẩm tối đa cần lấy
     * @return Danh sách nông sản thường được mua cùng
     */
    List<MarketPlaceDTO> getFrequentlyBoughtTogether(Integer marketplaceId, int limit);
    
    /**
     * Lấy danh sách nông sản phổ biến dựa trên xu hướng hiện tại và mùa vụ
     * 
     * @param pageable Thông tin phân trang
     * @return Danh sách nông sản theo xu hướng
     */
    Page<MarketPlaceDTO> getTrendingProducts(Pageable pageable);
    
    /**
     * Cập nhật dữ liệu mô hình gợi ý (nên được lên lịch chạy định kỳ)
     * Bao gồm cập nhật điểm tương tác, mối quan hệ giữa các sản phẩm và xu hướng mùa vụ
     */
    void updateRecommendationModels();
    
    /**
     * Ghi lại sự kiện người dùng xem sản phẩm nông sản
     * 
     * @param userId ID của người dùng
     * @param marketplaceId ID của sản phẩm nông sản được xem
     */
    void recordProductView(Integer userId, Integer marketplaceId);

    /**
     * Lấy danh sách nông sản theo mùa vụ hiện tại
     * 
     * @param pageable Thông tin phân trang
     * @return Danh sách nông sản đang trong mùa vụ
     */
    Page<MarketPlaceDTO> getSeasonalProducts(Pageable pageable);

    /**
     * Lấy danh sách nông sản sắp vào mùa vụ
     * 
     * @param pageable Thông tin phân trang
     * @return Danh sách nông sản sắp vào mùa
     */
    Page<MarketPlaceDTO> getUpcomingSeasonalProducts(Pageable pageable);
} 