package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.request.FlashSaleRequest;
import com.agricultural.agricultural.dto.request.FlashSaleItemRequest;
import com.agricultural.agricultural.dto.response.FlashSaleResponse;
import com.agricultural.agricultural.enums.FlashSaleStatus;

import java.util.List;

public interface IFlashSaleService {
    
    FlashSaleResponse createFlashSale(FlashSaleRequest request);
    
    FlashSaleResponse updateFlashSale(Integer id, FlashSaleRequest request);
    
    void deleteFlashSale(Integer id);
    
    FlashSaleResponse getFlashSaleById(Integer id);
    
    List<FlashSaleResponse> getFlashSalesByStatus(FlashSaleStatus status);
    
    List<FlashSaleResponse> getActiveFlashSales();
    
    List<FlashSaleResponse> getUpcomingFlashSales();
    
    FlashSaleResponse addProductToFlashSale(Integer flashSaleId, FlashSaleItemRequest request);
    
    FlashSaleResponse removeProductFromFlashSale(Integer flashSaleId, Integer productId);
    
    FlashSaleResponse updateFlashSaleStatus(Integer id, FlashSaleStatus status);
    
    void updateSoldQuantity(Integer flashSaleId, Integer productId, Integer quantitySold);
    
    boolean isProductInActiveFlashSale(Integer productId);
    
    FlashSaleResponse getActiveFlashSaleForProduct(Integer productId);
} 