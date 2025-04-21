package com.agricultural.agricultural.scheduler;

import com.agricultural.agricultural.entity.FlashSale;
import com.agricultural.agricultural.enums.FlashSaleStatus;
import com.agricultural.agricultural.repository.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FlashSaleScheduler {

    private final FlashSaleRepository flashSaleRepository;

    /**
     * Cập nhật trạng thái flash sale mỗi phút
     * - Chuyển trạng thái các flash sale đến thời gian bắt đầu từ 'upcoming' thành 'active'
     * - Chuyển trạng thái các flash sale hết thời gian từ 'active' thành 'ended'
     */
    @Scheduled(cron = "0 * * * * ?") // Chạy mỗi phút
    @Transactional
    public void updateFlashSaleStatus() {
        log.info("Bắt đầu cập nhật trạng thái flash sale");
        LocalDateTime now = LocalDateTime.now();
        int activatedCount = 0;
        int endedCount = 0;

        // Cập nhật trạng thái flash sale từ UPCOMING thành ACTIVE
        List<FlashSale> flashSalesToActivate = flashSaleRepository.findFlashSalesToActivate(
                now, FlashSaleStatus.UPCOMING);
        
        for (FlashSale flashSale : flashSalesToActivate) {
            flashSale.setStatus(FlashSaleStatus.ACTIVE);
            flashSaleRepository.save(flashSale);
            activatedCount++;
            log.info("Đã kích hoạt flash sale: {} (ID: {})", flashSale.getName(), flashSale.getId());
        }

        // Cập nhật trạng thái flash sale từ ACTIVE thành ENDED
        List<FlashSale> flashSalesToEnd = flashSaleRepository.findFlashSalesToEnd(
                now, FlashSaleStatus.ACTIVE);
        
        for (FlashSale flashSale : flashSalesToEnd) {
            flashSale.setStatus(FlashSaleStatus.ENDED);
            flashSaleRepository.save(flashSale);
            endedCount++;
            log.info("Đã kết thúc flash sale: {} (ID: {})", flashSale.getName(), flashSale.getId());
        }
        
        if (activatedCount > 0 || endedCount > 0) {
            log.info("Đã cập nhật trạng thái cho {} flash sale (kích hoạt: {}, kết thúc: {})", 
                    (activatedCount + endedCount), activatedCount, endedCount);
        }
    }
} 