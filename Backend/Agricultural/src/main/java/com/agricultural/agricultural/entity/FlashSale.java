package com.agricultural.agricultural.entity;

import com.agricultural.agricultural.enums.FlashSaleStatus;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flash_sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSale extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlashSaleStatus status = FlashSaleStatus.UPCOMING;
    
    @Column(nullable = false)
    private Integer discountPercentage;
    
    @Column(nullable = false)
    private BigDecimal maxDiscountAmount;
    
    @OneToMany(mappedBy = "flashSale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlashSaleItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Phương thức kiểm tra flash sale có đang hoạt động không
    @Transient
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return startTime.isBefore(now) && endTime.isAfter(now) && status == FlashSaleStatus.ACTIVE;
    }

    // Phương thức kiểm tra flash sale đã hết hạn chưa
    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(endTime);
    }

    // Phương thức thêm sản phẩm vào flash sale
    public void addItem(FlashSaleItem item) {
        items.add(item);
        item.setFlashSale(this);
    }

    // Phương thức xóa sản phẩm khỏi flash sale
    public void removeItem(FlashSaleItem item) {
        items.remove(item);
        item.setFlashSale(null);
    }
} 