package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.SellerRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ISellerRegistrationRepository extends JpaRepository<SellerRegistration, Integer> {
    
    /**
     * Tìm kiếm đăng ký bán hàng mới nhất của người dùng
     * @param userId ID người dùng
     * @return Optional của đăng ký bán hàng
     */
    Optional<SellerRegistration> findFirstByUserIdOrderByCreatedAtDesc(Integer userId);
    
    /**
     * Tìm kiếm tất cả đăng ký bán hàng của người dùng
     * @param userId ID người dùng
     * @return Danh sách đăng ký bán hàng
     */
    List<SellerRegistration> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    /**
     * Tìm kiếm tất cả đăng ký bán hàng theo trạng thái
     * @param status Trạng thái đăng ký
     * @return Danh sách đăng ký bán hàng
     */
    List<SellerRegistration> findByStatusOrderByCreatedAtDesc(String status);
    
    /**
     * Kiểm tra người dùng có đăng ký nào đang chờ xét duyệt không
     * @param userId ID người dùng
     * @param status Trạng thái đăng ký (PENDING)
     * @return true nếu có, false nếu không
     */
    boolean existsByUserIdAndStatus(Integer userId, String status);
    
    /**
     * Kiểm tra người dùng có đăng ký nào đã được chấp thuận không
     * @param userId ID người dùng
     * @param status Trạng thái đăng ký (APPROVED)
     * @return true nếu có, false nếu không
     */
    boolean existsByUserIdAndStatusEquals(Integer userId, String status);
    
    /**
     * Lấy tất cả đăng ký bán hàng với thông tin người dùng
     * Sử dụng JOIN FETCH để đảm bảo thông tin người dùng được tải
     * @return Danh sách đăng ký bán hàng
     */
    @Query("SELECT sr FROM SellerRegistration sr JOIN FETCH sr.user ORDER BY CASE WHEN sr.createdAt IS NULL THEN 0 ELSE 1 END, sr.id DESC")
    List<SellerRegistration> findAllWithUsers();
    
    /**
     * Lấy danh sách đăng ký bán hàng theo trạng thái với thông tin người dùng
     * @param status Trạng thái đăng ký
     * @return Danh sách đăng ký bán hàng
     */
    @Query("SELECT sr FROM SellerRegistration sr JOIN FETCH sr.user WHERE sr.status = :status ORDER BY CASE WHEN sr.createdAt IS NULL THEN 0 ELSE 1 END, sr.createdAt DESC, sr.id DESC")
    List<SellerRegistration> findByStatusWithUsers(String status);
} 