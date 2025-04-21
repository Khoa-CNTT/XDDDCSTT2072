package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.request.CouponRequest;
import com.agricultural.agricultural.dto.response.CouponDTO;
import com.agricultural.agricultural.entity.Coupon;
import com.agricultural.agricultural.entity.Coupon.CouponStatus;
import com.agricultural.agricultural.entity.Order;
import com.agricultural.agricultural.entity.OrderCoupon;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.CouponMapper;
import com.agricultural.agricultural.repository.ICouponRepository;
import com.agricultural.agricultural.repository.IOrderCouponRepository;
import com.agricultural.agricultural.repository.IOrderRepository;
import com.agricultural.agricultural.service.ICouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements ICouponService {

    private final ICouponRepository couponRepository;
    private final IOrderRepository orderRepository;
    private final IOrderCouponRepository orderCouponRepository;
    private final CouponMapper couponMapper;

    @Override
    @Transactional
    public CouponDTO createCoupon(CouponRequest request) {
        log.info("Tạo mã giảm giá mới: {}", request.getCode());
        
        // Kiểm tra valid
        request.validateData();
        
        // Kiểm tra mã đã tồn tại chưa
        if (couponRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã giảm giá đã tồn tại: " + request.getCode());
        }
        
        // Chuyển đổi và lưu coupon
        Coupon coupon = couponMapper.toEntity(request);
        coupon = couponRepository.save(coupon);
        
        log.info("Đã tạo thành công mã giảm giá: {}", coupon.getCode());
        return couponMapper.toDTO(coupon);
    }

    @Override
    @Transactional
    public CouponDTO updateCoupon(Integer id, CouponRequest request) {
        log.info("Cập nhật mã giảm giá ID: {}", id);
        
        // Kiểm tra valid
        request.validateData();
        
        // Tìm coupon
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá ID: " + id));
        
        // Kiểm tra code đã tồn tại chưa (nếu thay đổi code)
        if (!coupon.getCode().equals(request.getCode()) && couponRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã giảm giá đã tồn tại: " + request.getCode());
        }
        
        // Cập nhật dữ liệu
        couponMapper.updateFromRequest(request, coupon);
        coupon = couponRepository.save(coupon);
        
        log.info("Đã cập nhật thành công mã giảm giá ID: {}", id);
        return couponMapper.toDTO(coupon);
    }

    @Override
    public CouponDTO getCouponById(Integer id) {
        log.info("Lấy thông tin mã giảm giá ID: {}", id);
        
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá ID: " + id));
        
        return couponMapper.toDTO(coupon);
    }

    @Override
    public CouponDTO getCouponByCode(String code) {
        log.info("Lấy thông tin mã giảm giá code: {}", code);
        
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá: " + code));
        
        return couponMapper.toDTO(coupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Integer id) {
        log.info("Xóa mã giảm giá ID: {}", id);
        
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy mã giảm giá ID: " + id);
        }
        
        couponRepository.deleteById(id);
        log.info("Đã xóa mã giảm giá ID: {}", id);
    }

    @Override
    public Page<CouponDTO> getAllCoupons(Pageable pageable, String status) {
        log.info("Lấy danh sách mã giảm giá - trang: {}, size: {}, status: {}", 
                pageable.getPageNumber(), pageable.getPageSize(), status);
        
        Page<Coupon> couponsPage;
        if (status != null && !status.isEmpty()) {
            // Lọc theo trạng thái
            CouponStatus couponStatus = CouponStatus.valueOf(status);
            couponsPage = couponRepository.findAll(pageable); // Cần bổ sung findByStatus method
        } else {
            couponsPage = couponRepository.findAll(pageable);
        }
        
        return couponsPage.map(couponMapper::toDTO);
    }

    @Override
    public List<CouponDTO> getActiveCoupons() {
        log.info("Lấy danh sách mã giảm giá đang hoạt động");
        
        List<Coupon> activeCoupons = couponRepository.findAllActiveCoupons(CouponStatus.active, LocalDateTime.now());
        return couponMapper.toDTOList(activeCoupons);
    }

    @Override
    public List<CouponDTO> getCouponsForUser(Integer userId) {
        log.info("Lấy danh sách mã giảm giá cho người dùng ID: {}", userId);
        
        List<Coupon> coupons = couponRepository.findCouponsForUser(CouponStatus.active, userId, LocalDateTime.now());
        return couponMapper.toDTOList(coupons);
    }

    @Override
    public List<CouponDTO> getCouponsForProduct(Integer productId) {
        log.info("Lấy danh sách mã giảm giá cho sản phẩm ID: {}", productId);
        
        List<Coupon> coupons = couponRepository.findCouponsForProduct(CouponStatus.active, productId, LocalDateTime.now());
        return couponMapper.toDTOList(coupons);
    }

    @Override
    public List<CouponDTO> getCouponsForCategory(Integer categoryId) {
        log.info("Lấy danh sách mã giảm giá cho danh mục ID: {}", categoryId);
        
        List<Coupon> coupons = couponRepository.findCouponsForCategory(CouponStatus.active, categoryId, LocalDateTime.now());
        return couponMapper.toDTOList(coupons);
    }

    @Override
    public CouponDTO validateCoupon(String code, Integer userId, BigDecimal orderAmount) {
        log.info("Kiểm tra mã giảm giá: {} cho người dùng ID: {}, giá trị đơn hàng: {}", 
                code, userId, orderAmount);
        
        // Tìm coupon
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại: " + code));
        
        // Kiểm tra còn hiệu lực không
        if (coupon.getStatus() != CouponStatus.active) {
            throw new BadRequestException("Mã giảm giá không còn hoạt động");
        }
        
        // Kiểm tra còn trong thời gian hiệu lực không
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã giảm giá không trong thời gian hiệu lực");
        }
        
        // Kiểm tra số lần sử dụng
        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }
        
        // Kiểm tra giá trị đơn hàng tối thiểu
        if (orderAmount.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new BadRequestException("Giá trị đơn hàng chưa đạt tối thiểu " + 
                    coupon.getMinOrderValue() + "đ để áp dụng mã giảm giá");
        }
        
        // Kiểm tra mã dành riêng cho người dùng
        if (coupon.getUserSpecific() && !coupon.getSpecificUserId().equals(userId)) {
            throw new BadRequestException("Mã giảm giá này không áp dụng cho tài khoản của bạn");
        }
        
        return couponMapper.toDTO(coupon);
    }

    @Override
    @Transactional
    public BigDecimal applyCoupon(Integer orderId, String couponCode) {
        log.info("Áp dụng mã giảm giá: {} cho đơn hàng ID: {}", couponCode, orderId);
        
        // Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID: " + orderId));
        
        // Tìm coupon
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại: " + couponCode));
        
        // Kiểm tra đơn hàng đã áp dụng coupon này chưa
        if (orderCouponRepository.existsByOrderIdAndCouponId(orderId, coupon.getId())) {
            throw new BadRequestException("Đơn hàng đã áp dụng mã giảm giá này rồi");
        }
        
        // Kiểm tra coupon có hợp lệ không
        validateCoupon(couponCode, order.getBuyerId(), order.getSubtotal());
        
        // Tính số tiền giảm giá
        BigDecimal discountAmount = coupon.calculateDiscount(order.getSubtotal());
        
        // Tạo bản ghi order_coupon
        OrderCoupon orderCoupon = OrderCoupon.builder()
                .orderId(orderId)
                .couponId(coupon.getId())
                .discountAmount(discountAmount)
                .build();
        
        orderCouponRepository.save(orderCoupon);
        
        // Cập nhật số lần sử dụng
        coupon.incrementUsage();
        couponRepository.save(coupon);
        
        // Cập nhật số tiền giảm giá cho đơn hàng
        order.setDiscountAmount(discountAmount);
        // Recalculate total_amount (giả sử có phương thức setTotalAmount)
        order.calculateTotals();
        orderRepository.save(order);
        
        log.info("Đã áp dụng mã giảm giá: {} cho đơn hàng ID: {}, giảm: {}", 
                couponCode, orderId, discountAmount);
        
        return discountAmount;
    }

    @Override
    @Transactional
    public void removeCouponFromOrder(Integer orderId, Integer couponId) {
        log.info("Hủy áp dụng mã giảm giá ID: {} cho đơn hàng ID: {}", couponId, orderId);
        
        // Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID: " + orderId));
        
        // Tìm order_coupon
        OrderCoupon orderCoupon = orderCouponRepository.findByOrderIdAndCouponId(orderId, couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá áp dụng cho đơn hàng này"));
        
        // Xóa order_coupon
        orderCouponRepository.delete(orderCoupon);
        
        // Cập nhật lại đơn hàng
        order.setDiscountAmount(BigDecimal.ZERO);
        order.calculateTotals();
        orderRepository.save(order);
        
        log.info("Đã hủy áp dụng mã giảm giá cho đơn hàng ID: {}", orderId);
    }

    @Override
    public BigDecimal calculateDiscount(String couponCode, BigDecimal orderAmount) {
        log.info("Tính số tiền giảm giá cho mã: {}, giá trị đơn hàng: {}", couponCode, orderAmount);
        
        // Tìm coupon
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại: " + couponCode));
        
        // Kiểm tra còn hiệu lực không
        if (!coupon.isValid()) {
            return BigDecimal.ZERO;
        }
        
        // Tính toán giảm giá
        return coupon.calculateDiscount(orderAmount);
    }
} 