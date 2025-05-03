package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface IMarketPlaceService {
    MarketPlaceDTO createProduct(MarketPlaceDTO productDTO);
    MarketPlaceDTO updateProduct(Integer id, MarketPlaceDTO productDTO);
    void deleteProduct(Integer id);
    MarketPlaceDTO getProduct(Integer id);
    Page<MarketPlaceDTO> getAllProducts(Pageable pageable);
    Page<MarketPlaceDTO> searchProducts(String keyword, Pageable pageable);
    Page<MarketPlaceDTO> getAvailableProducts(Pageable pageable);
    Page<MarketPlaceDTO> getProductsByCategory(Integer categoryId, Pageable pageable);
    Page<MarketPlaceDTO> getOnSaleProducts(Pageable pageable);
    Page<MarketPlaceDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    Page<MarketPlaceDTO> getProductsByMinimumRating(BigDecimal minRating, Pageable pageable);
    Page<MarketPlaceDTO> getPopularProducts(Pageable pageable);
    Page<MarketPlaceDTO> getRecentlyUpdatedProducts(Pageable pageable);
    Page<MarketPlaceDTO> advancedSearch(
        Integer categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String keyword,
        boolean onSaleOnly,
        String sortBy,
        Pageable pageable
    );
    Page<MarketPlaceDTO> getProductsByUser(Integer userId, Pageable pageable);
    
    /**
     * Tạo sản phẩm mới từ form-data với hình ảnh
     * 
     * @param productName Tên sản phẩm
     * @param description Mô tả chi tiết
     * @param shortDescription Mô tả ngắn
     * @param quantity Số lượng
     * @param price Giá
     * @param salePrice Giá khuyến mãi
     * @param saleStartDate Ngày bắt đầu khuyến mãi
     * @param saleEndDate Ngày kết thúc khuyến mãi
     * @param categoryId ID danh mục
     * @param sku Mã SKU
     * @param weight Cân nặng
     * @param dimensions Kích thước
     * @param image File ảnh
     * @return Sản phẩm đã tạo
     * @throws IOException Nếu có lỗi khi xử lý ảnh
     */
    MarketPlaceDTO createProductWithImage(
            String productName,
            String description,
            String shortDescription,
            int quantity,
            BigDecimal price,
            BigDecimal salePrice,
            LocalDateTime saleStartDate,
            LocalDateTime saleEndDate,
            Integer categoryId,
            String sku,
            Double weight,
            String dimensions,
            MultipartFile image) throws IOException;
    
    /**
     * Cập nhật sản phẩm từ form-data với hình ảnh
     * 
     * @param id ID sản phẩm cần cập nhật
     * @param productDTO DTO của sản phẩm cần cập nhật
     * @return Sản phẩm đã cập nhật
     * @throws IOException Nếu có lỗi khi xử lý ảnh
     */
    MarketPlaceDTO updateProductWithImage(Integer id, MarketPlaceDTO productDTO) throws IOException;

    /**
     * Refresh trạng thái tồn kho của tất cả sản phẩm
     * @return Danh sách các sản phẩm đã cập nhật
     */
    List<MarketPlaceDTO> refreshAllStockStatus();

    /**
     * Làm mới dữ liệu của tất cả sản phẩm, cập nhật trạng thái tồn kho và các thông tin khác
     *
     * @return Danh sách DTO của các sản phẩm đã được làm mới
     */
    List<MarketPlaceDTO> refreshAllProducts();
} 