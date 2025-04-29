package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IVoucherRepository extends JpaRepository<Voucher, Integer> {
    Optional<Voucher> findByCodeAndIsActiveTrue(String code);
    
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.usageLimit IS NULL OR v.usageCount < v.usageLimit)")
    List<Voucher> findAllActiveVouchers(LocalDateTime now);
    
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.usageLimit IS NULL OR v.usageCount < v.usageLimit) " +
           "AND v.type = 'PLATFORM'")
    List<Voucher> findAllActivePlatformVouchers(LocalDateTime now);
    
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.usageLimit IS NULL OR v.usageCount < v.usageLimit) " +
           "AND v.type = 'SHOP' AND v.shopId = :shopId")
    List<Voucher> findAllActiveShopVouchers(LocalDateTime now, Integer shopId);
    
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.usageLimit IS NULL OR v.usageCount < v.usageLimit) " +
           "AND v.isShippingVoucher = true")
    List<Voucher> findAllActiveShippingVouchers(LocalDateTime now);
} 