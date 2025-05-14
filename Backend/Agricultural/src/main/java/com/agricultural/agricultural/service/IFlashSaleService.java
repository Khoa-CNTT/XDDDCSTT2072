package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.request.FlashSaleRequest;
import com.agricultural.agricultural.dto.request.FlashSaleItemRequest;
import com.agricultural.agricultural.dto.response.FlashSaleResponse;
import com.agricultural.agricultural.enums.FlashSaleStatus;

import java.util.List;

public interface IFlashSaleService {
    
    // Tạo flash sale mới
    FlashSaleResponse createFlashSale(FlashSaleRequest request);
    
    // Cập nhật thông tin flash sale
    FlashSaleResponse updateFlashSale(Integer id, FlashSaleRequest request);
    
    // Xóa flash sale
    void deleteFlashSale(Integer id);
    
    // Lấy thông tin chi tiết flash sale
    FlashSaleResponse getFlashSaleById(Integer id);
    
    // Lấy danh sách flash sale theo trạng thái
    List<FlashSaleResponse> getFlashSalesByStatus(FlashSaleStatus status);
    
    // Lấy danh sách flash sale đang hoạt động
    List<FlashSaleResponse> getActiveFlashSales();
    
    // Lấy danh sách flash sale sắp diễn ra
    List<FlashSaleResponse> getUpcomingFlashSales();
    
    // Thêm sản phẩm vào flash sale
    FlashSaleResponse addProductToFlashSale(Integer flashSaleId, FlashSaleItemRequest request);
    
    // Xóa sản phẩm khỏi flash sale
    FlashSaleResponse removeProductFromFlashSale(Integer flashSaleId, Integer productId);
    
    // Cập nhật trạng thái flash sale
    FlashSaleResponse updateFlashSaleStatus(Integer id, FlashSaleStatus status);
    
    // Cập nhật số lượng đã bán của sản phẩm trong flash sale
    void updateSoldQuantity(Integer flashSaleId, Integer productId, Integer quantitySold);
    
    // Kiểm tra sản phẩm có nằm trong flash sale đang hoạt động không
    boolean isProductInActiveFlashSale(Integer productId);
    
    // Lấy thông tin flash sale item của sản phẩm đang active
    FlashSaleResponse getActiveFlashSaleForProduct(Integer productId);
} 