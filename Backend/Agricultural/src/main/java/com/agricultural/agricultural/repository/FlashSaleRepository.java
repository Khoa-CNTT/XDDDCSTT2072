package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.FlashSale;
import com.agricultural.agricultural.enums.FlashSaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Integer> {
    
    /**
     * Tìm các flash sale theo trạng thái
     */
    List<FlashSale> findByStatus(FlashSaleStatus status);
    
    /**
     * Tìm các flash sale đang hoạt động
     */
    @Query("SELECT f FROM FlashSale f WHERE f.status = :status AND f.startTime <= :now AND f.endTime >= :now")
    List<FlashSale> findCurrentlyActiveFlashSales(@Param("now") LocalDateTime now, @Param("status") FlashSaleStatus status);
    
    /**
     * Tìm các flash sale sắp diễn ra
     */
    @Query("SELECT f FROM FlashSale f WHERE f.status = :status AND f.startTime > :now")
    List<FlashSale> findUpcomingFlashSales(@Param("now") LocalDateTime now, @Param("status") FlashSaleStatus status);
    
    /**
     * Tìm các flash sale cần kích hoạt (chuyển từ UPCOMING sang ACTIVE)
     */
    @Query("SELECT f FROM FlashSale f WHERE f.status = :status AND f.startTime <= :now")
    List<FlashSale> findFlashSalesToActivate(@Param("now") LocalDateTime now, @Param("status") FlashSaleStatus status);
    
    /**
     * Tìm các flash sale cần kết thúc (chuyển từ ACTIVE sang ENDED)
     */
    @Query("SELECT f FROM FlashSale f WHERE f.status = :status AND f.endTime <= :now")
    List<FlashSale> findFlashSalesToEnd(@Param("now") LocalDateTime now, @Param("status") FlashSaleStatus status);

    List<FlashSale> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
} 