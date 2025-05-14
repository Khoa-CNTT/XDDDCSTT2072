package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.request.FlashSaleRequest;
import com.agricultural.agricultural.dto.request.FlashSaleItemRequest;
import com.agricultural.agricultural.dto.response.FlashSaleResponse;
import com.agricultural.agricultural.dto.response.FlashSaleItemResponse;
import com.agricultural.agricultural.entity.FlashSale;
import com.agricultural.agricultural.entity.FlashSaleItem;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.enums.FlashSaleStatus;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.FlashSaleRepository;
import com.agricultural.agricultural.repository.FlashSaleItemRepository;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.service.IFlashSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlashSaleServiceImpl implements IFlashSaleService {

    private final FlashSaleRepository flashSaleRepository;
    private final FlashSaleItemRepository flashSaleItemRepository;
    private final IMarketPlaceRepository marketPlaceRepository;

    @Override
    @Transactional
    public FlashSaleResponse createFlashSale(FlashSaleRequest request) {
        log.info("Tạo flash sale mới: {}", request);
        
        // Tạo đối tượng flash sale từ request
        FlashSale flashSale = new FlashSale();
        flashSale.setName(request.getName());
        flashSale.setDescription(request.getDescription());
        flashSale.setStartTime(request.getStartDate());
        flashSale.setEndTime(request.getEndDate());
        flashSale.setStatus(request.getStatus());
        flashSale.setDiscountPercentage(request.getDiscountPercentage());
        flashSale.setMaxDiscountAmount(request.getMaxDiscountAmount());
        
        // Lưu flash sale vào database
        FlashSale savedFlashSale = flashSaleRepository.save(flashSale);
        
        return mapToFlashSaleResponse(savedFlashSale);
    }

    @Override
    @Transactional
    public FlashSaleResponse updateFlashSale(Integer id, FlashSaleRequest request) {
        log.info("Cập nhật flash sale ID {}: {}", id, request);
        
        // Tìm flash sale theo ID
        FlashSale flashSale = flashSaleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flash sale không tồn tại với ID: " + id));
        
        // Cập nhật thông tin flash sale
        flashSale.setName(request.getName());
        flashSale.setDescription(request.getDescription());
        flashSale.setStartTime(request.getStartDate());
        flashSale.setEndTime(request.getEndDate());
        flashSale.setStatus(request.getStatus());
        flashSale.setDiscountPercentage(request.getDiscountPercentage());
        flashSale.setMaxDiscountAmount(request.getMaxDiscountAmount());
        
        // Lưu thay đổi vào database
        FlashSale updatedFlashSale = flashSaleRepository.save(flashSale);
        
        return mapToFlashSaleResponse(updatedFlashSale);
    }

    @Override
    @Transactional
    public void deleteFlashSale(Integer id) {
        log.info("Xóa flash sale ID: {}", id);
        
        // Tìm flash sale theo ID
        FlashSale flashSale = flashSaleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flash sale không tồn tại với ID: " + id));
        
        // Xóa flash sale khỏi database
        flashSaleRepository.delete(flashSale);
    }

    @Override
    public FlashSaleResponse getFlashSaleById(Integer id) {
        log.info("Lấy thông tin flash sale ID: {}", id);
        
        // Tìm flash sale theo ID
        FlashSale flashSale = flashSaleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flash sale không tồn tại với ID: " + id));
        
        return mapToFlashSaleResponse(flashSale);
    }

    @Override
    public List<FlashSaleResponse> getFlashSalesByStatus(FlashSaleStatus status) {
        log.info("Lấy danh sách flash sale theo trạng thái: {}", status);
        
        // Lấy danh sách flash sale theo trạng thái
        List<FlashSale> flashSales = flashSaleRepository.findByStatus(status);
        
        return flashSales.stream()
            .map(this::mapToFlashSaleResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<FlashSaleResponse> getActiveFlashSales() {
        log.info("Lấy danh sách flash sale đang hoạt động");
        
        // Lấy danh sách flash sale đang hoạt động
        List<FlashSale> activeFlashSales = flashSaleRepository.findCurrentlyActiveFlashSales(
            LocalDateTime.now(), FlashSaleStatus.ACTIVE);
        
        return activeFlashSales.stream()
            .map(this::mapToFlashSaleResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<FlashSaleResponse> getUpcomingFlashSales() {
        log.info("Lấy danh sách flash sale sắp diễn ra");
        
        // Lấy danh sách flash sale sắp diễn ra
        List<FlashSale> upcomingFlashSales = flashSaleRepository.findUpcomingFlashSales(
            LocalDateTime.now(), FlashSaleStatus.UPCOMING);
        
        return upcomingFlashSales.stream()
            .map(this::mapToFlashSaleResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FlashSaleResponse addProductToFlashSale(Integer flashSaleId, FlashSaleItemRequest request) {
        log.info("Thêm sản phẩm vào flash sale ID {}: {}", flashSaleId, request);
        
        // Tìm flash sale theo ID
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
            .orElseThrow(() -> new ResourceNotFoundException("Flash sale không tồn tại với ID: " + flashSaleId));
        
        // Tìm sản phẩm theo ID
        MarketPlace product = marketPlaceRepository.findById(request.getProductId().intValue())
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại với ID: " + request.getProductId()));
        
        // Kiểm tra xem sản phẩm đã tồn tại trong flash sale chưa
        flashSaleItemRepository.findByFlashSaleAndProduct(flashSale, product)
            .ifPresent(item -> {
                throw new IllegalArgumentException("Sản phẩm đã tồn tại trong flash sale");
            });
        
        // Tạo đối tượng flash sale item từ request
        FlashSaleItem flashSaleItem = new FlashSaleItem();
        flashSaleItem.setFlashSale(flashSale);
        flashSaleItem.setProduct(product);
        flashSaleItem.setStockQuantity(request.getStockQuantity());
        flashSaleItem.setSoldQuantity(0);
        flashSaleItem.setDiscountPrice(request.getDiscountPrice());
        flashSaleItem.setOriginalPrice(request.getOriginalPrice());
        
        // Tính phần trăm giảm giá nếu không được cung cấp
        Integer discountPercentage = request.getDiscountPercentage();
        if (discountPercentage == null) {
            BigDecimal discount = request.getOriginalPrice().subtract(request.getDiscountPrice());
            discountPercentage = discount.multiply(BigDecimal.valueOf(100))
                .divide(request.getOriginalPrice(), 0, BigDecimal.ROUND_DOWN)
                .intValue();
        }
        flashSaleItem.setDiscountPercentage(discountPercentage);
        
        // Thêm item vào flash sale
        flashSale.addItem(flashSaleItem);
        
        // Lưu thay đổi vào database
        flashSaleItemRepository.save(flashSaleItem);
        FlashSale updatedFlashSale = flashSaleRepository.save(flashSale);
        
        return mapToFlashSaleResponse(updatedFlashSale);
    }

    @Override
    @Transactional
    public FlashSaleResponse removeProductFromFlashSale(Integer flashSaleId, Integer productId) {
        log.info("Xóa sản phẩm ID {} khỏi flash sale ID {}", productId, flashSaleId);
        
        // Tìm flash sale theo ID
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
            .orElseThrow(() -> new ResourceNotFoundException("Flash sale không tồn tại với ID: " + flashSaleId));
        
        // Tìm flash sale item theo flash sale ID và product ID
        FlashSaleItem flashSaleItem = flashSaleItemRepository.findByFlashSaleIdAndProductId(flashSaleId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong flash sale"));
        
        // Xóa flash sale item khỏi flash sale
        flashSale.removeItem(flashSaleItem);
        
        // Xóa flash sale item khỏi database
        flashSaleItemRepository.delete(flashSaleItem);
        
        // Lưu thay đổi vào database
        FlashSale updatedFlashSale = flashSaleRepository.save(flashSale);
        
        return mapToFlashSaleResponse(updatedFlashSale);
    }

    @Override
    @Transactional
    public FlashSaleResponse updateFlashSaleStatus(Integer id, FlashSaleStatus status) {
        log.info("Cập nhật trạng thái flash sale ID {} thành {}", id, status);
        
        // Tìm flash sale theo ID
        FlashSale flashSale = flashSaleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Flash sale không tồn tại với ID: " + id));
        
        // Cập nhật trạng thái flash sale
        flashSale.setStatus(status);
        
        // Lưu thay đổi vào database
        FlashSale updatedFlashSale = flashSaleRepository.save(flashSale);
        
        return mapToFlashSaleResponse(updatedFlashSale);
    }

    @Override
    @Transactional
    public void updateSoldQuantity(Integer flashSaleId, Integer productId, Integer quantitySold) {
        log.info("Cập nhật số lượng đã bán cho sản phẩm ID {} trong flash sale ID {}: {}", productId, flashSaleId, quantitySold);
        
        // Tìm flash sale item theo flash sale ID và product ID
        FlashSaleItem flashSaleItem = flashSaleItemRepository.findByFlashSaleIdAndProductId(flashSaleId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong flash sale"));
        
        // Kiểm tra số lượng còn lại
        if (flashSaleItem.getSoldQuantity() + quantitySold > flashSaleItem.getStockQuantity()) {
            throw new IllegalArgumentException("Số lượng yêu cầu vượt quá số lượng còn lại");
        }
        
        // Cập nhật số lượng đã bán
        flashSaleItem.setSoldQuantity(flashSaleItem.getSoldQuantity() + quantitySold);
        
        // Lưu thay đổi vào database
        flashSaleItemRepository.save(flashSaleItem);
    }

    @Override
    public boolean isProductInActiveFlashSale(Integer productId) {
        log.info("Kiểm tra sản phẩm ID {} có trong flash sale đang hoạt động không", productId);
        
        // Kiểm tra sản phẩm có trong flash sale đang hoạt động không
        return flashSaleItemRepository.isProductInActiveFlashSale(productId);
    }

    @Override
    public FlashSaleResponse getActiveFlashSaleForProduct(Integer productId) {
        log.info("Lấy thông tin flash sale đang hoạt động cho sản phẩm ID {}", productId);
        
        // Tìm flash sale item theo product ID
        FlashSaleItem flashSaleItem = flashSaleItemRepository.findActiveFlashSaleItemByProductId(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong flash sale đang hoạt động"));
        
        // Lấy thông tin flash sale
        FlashSale flashSale = flashSaleItem.getFlashSale();
        
        return mapToFlashSaleResponse(flashSale);
    }
    
    /**
     * Chuyển đổi đối tượng FlashSale thành FlashSaleResponse
     */
    private FlashSaleResponse mapToFlashSaleResponse(FlashSale flashSale) {
        // Tạo đối tượng FlashSaleResponse từ FlashSale
        FlashSaleResponse response = FlashSaleResponse.builder()
            .id(Long.valueOf(flashSale.getId()))
            .name(flashSale.getName())
            .description(flashSale.getDescription())
            .startDate(flashSale.getStartTime())
            .endDate(flashSale.getEndTime())
            .status(flashSale.getStatus())
            .discountPercentage(flashSale.getDiscountPercentage())
            .maxDiscountAmount(flashSale.getMaxDiscountAmount())
            .build();
        
        // Lấy danh sách flash sale item
        List<FlashSaleItem> items = flashSaleItemRepository.findByFlashSale(flashSale);
        
        // Map danh sách FlashSaleItem thành FlashSaleItemResponse
        List<FlashSaleItemResponse> itemResponses = items.stream()
            .map(this::mapToFlashSaleItemResponse)
            .collect(Collectors.toList());
        
        response.setItems(itemResponses);
        
        return response;
    }
    
    /**
     * Chuyển đổi đối tượng FlashSaleItem thành FlashSaleItemResponse
     */
    private FlashSaleItemResponse mapToFlashSaleItemResponse(FlashSaleItem item) {
        return FlashSaleItemResponse.builder()
            .id(item.getId())
            .productId(item.getProduct().getId())
            .productName(item.getProduct().getProductName())
            .productImage(item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty() 
                ? item.getProduct().getImages().get(0).getImageUrl() : null)
            .stockQuantity(item.getStockQuantity())
            .soldQuantity(item.getSoldQuantity())
            .remainingStock(item.getRemainingStock())
            .discountPrice(item.getDiscountPrice())
            .originalPrice(item.getOriginalPrice())
            .discountPercentage(item.getDiscountPercentage())
            .hasStock(item.hasStock())
            .build();
    }
} 