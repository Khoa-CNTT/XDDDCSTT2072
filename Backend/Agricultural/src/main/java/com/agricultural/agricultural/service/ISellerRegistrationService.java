package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.SellerRegistrationDTO;

import java.util.List;
import java.util.Optional;

public interface ISellerRegistrationService {
    
    /**
     * Tạo đơn đăng ký bán hàng mới cho người dùng hiện tại
     * @param registrationDTO Thông tin đăng ký
     * @return Thông tin đăng ký đã tạo
     */
    SellerRegistrationDTO createRegistration(SellerRegistrationDTO registrationDTO);
    
    /**
     * Lấy thông tin đăng ký bán hàng mới nhất của người dùng hiện tại
     * @return Thông tin đăng ký
     */
    Optional<SellerRegistrationDTO> getCurrentUserLatestRegistration();
    
    /**
     * Lấy danh sách đăng ký bán hàng của người dùng hiện tại
     * @return Danh sách đăng ký
     */
    List<SellerRegistrationDTO> getCurrentUserRegistrations();
    
    /**
     * Phê duyệt đăng ký bán hàng (chỉ admin)
     * @param id ID đăng ký
     * @param notes Ghi chú khi phê duyệt
     * @return Thông tin đăng ký đã cập nhật
     */
    SellerRegistrationDTO approveRegistration(Integer id, String notes);
    
    /**
     * Từ chối đăng ký bán hàng (chỉ admin)
     * @param id ID đăng ký
     * @param notes Lý do từ chối
     * @return Thông tin đăng ký đã cập nhật
     */
    SellerRegistrationDTO rejectRegistration(Integer id, String notes);
    
    /**
     * Lấy danh sách tất cả đăng ký bán hàng (chỉ admin)
     * @return Danh sách đăng ký
     */
    List<SellerRegistrationDTO> getAllRegistrations();
    
    /**
     * Lấy danh sách đăng ký bán hàng theo trạng thái (chỉ admin)
     * @param status Trạng thái đăng ký
     * @return Danh sách đăng ký
     */
    List<SellerRegistrationDTO> getRegistrationsByStatus(String status);
    
    /**
     * Kiểm tra người dùng hiện tại có đăng ký đang chờ xét duyệt hay không
     * @return true nếu có, false nếu không
     */
    boolean hasCurrentUserPendingRegistration();
    
    /**
     * Kiểm tra người dùng hiện tại có đăng ký đã được chấp thuận hay không
     * @return true nếu có, false nếu không
     */
    boolean hasCurrentUserApprovedRegistration();
    
    /**
     * Kiểm tra người dùng có đăng ký đã được chấp thuận hay không
     * @param userId ID người dùng
     * @return true nếu có, false nếu không
     */
    boolean hasUserApprovedRegistration(Integer userId);
} 