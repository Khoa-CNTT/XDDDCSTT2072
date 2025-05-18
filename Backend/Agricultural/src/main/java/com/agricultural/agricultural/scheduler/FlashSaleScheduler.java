package com.agricultural.agricultural.scheduler;

import com.agricultural.agricultural.dto.NotificationDTO;
import com.agricultural.agricultural.entity.FlashSale;
import com.agricultural.agricultural.enums.FlashSaleStatus;
import com.agricultural.agricultural.repository.FlashSaleRepository;
import com.agricultural.agricultural.service.INotificationService;
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
    private final INotificationService notificationService;

    /**
     * Cập nhật trạng thái flash sale mỗi phút
     * - Chuyển trạng thái các flash sale đến thời gian bắt đầu từ 'upcoming' thành 'active'
     * - Chuyển trạng thái các flash sale hết thời gian từ 'active' thành 'ended'
     */
    @Scheduled(cron = "0 0 0 1 * ?") // Chạy vào lúc 00:00:00 ngày đầu tiên mỗi tháng
    @Transactional
    public void updateFlashSaleStatus() {
        log.info("Bắt đầu cập nhật trạng thái flash sale");
        LocalDateTime now = LocalDateTime.now();
        int activatedCount = 0;
        int endedCount = 0;

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

    /**
     * Kiểm tra các flash sale sắp diễn ra và gửi thông báo
     * Chạy mỗi 10 phút
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkUpcomingFlashSales() {
        log.info("Kiểm tra flash sale sắp diễn ra...");
        
        try {
            // Tìm các flash sale sắp diễn ra trong vòng 30 phút
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime thirtyMinutesLater = now.plusMinutes(30);
            
            List<FlashSale> upcomingFlashSales = flashSaleRepository.findByStartTimeBetween(now, thirtyMinutesLater);
            
            for (FlashSale flashSale : upcomingFlashSales) {
                // Kiểm tra xem flash sale đã được thông báo chưa
                if (flashSale.getIsNotified() == null || !flashSale.getIsNotified()) {
                    log.info("Gửi thông báo cho flash sale: {}", flashSale.getName());
                    
                    // Thông báo cho tất cả người dùng về flash sale sắp diễn ra
                    NotificationDTO notification = NotificationDTO.builder()
                            .title("Flash Sale sắp diễn ra!")
                            .message("Flash Sale " + flashSale.getName() + " sẽ bắt đầu trong vòng 30 phút nữa. Chuẩn bị săn sale!")
                            .type("FLASH_SALE_UPCOMING")
                            .redirectUrl("/flash-sales/" + flashSale.getId())
                            .build();
                    
                    notificationService.sendRealTimeNotificationToAll(notification);
                    
                    // Cập nhật trạng thái đã thông báo
                    flashSale.setIsNotified(true);
                    flashSaleRepository.save(flashSale);
                }
            }
            
            log.info("Hoàn thành kiểm tra flash sale sắp diễn ra");
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra flash sale sắp diễn ra: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Kiểm tra các flash sale đang diễn ra và gửi thông báo khi bắt đầu
     * Chạy mỗi phút
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void notifyFlashSaleStarted() {
        log.info("Kiểm tra flash sale đang bắt đầu...");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime oneMinuteAgo = now.minusMinutes(1);
            
            // Tìm các flash sale vừa bắt đầu trong vòng 1 phút trước
            List<FlashSale> justStartedFlashSales = flashSaleRepository.findByStartTimeBetween(oneMinuteAgo, now);
            
            for (FlashSale flashSale : justStartedFlashSales) {
                // Kiểm tra xem flash sale đã được thông báo bắt đầu chưa
                if (flashSale.getIsStartNotified() == null || !flashSale.getIsStartNotified()) {
                    log.info("Gửi thông báo flash sale đã bắt đầu: {}", flashSale.getName());
                    
                    // Thông báo cho tất cả người dùng về flash sale đã bắt đầu
                    NotificationDTO notification = NotificationDTO.builder()
                            .title("Flash Sale đã bắt đầu!")
                            .message("Flash Sale " + flashSale.getName() + " đã chính thức bắt đầu! Nhanh tay săn ngay deal hot.")
                            .type("FLASH_SALE_STARTED")
                            .redirectUrl("/flash-sales/" + flashSale.getId())
                            .build();
                    
                    notificationService.sendRealTimeNotificationToAll(notification);
                    
                    // Cập nhật trạng thái đã thông báo bắt đầu
                    flashSale.setIsStartNotified(true);
                    flashSaleRepository.save(flashSale);
                }
            }
            
            log.info("Hoàn thành kiểm tra flash sale đang bắt đầu");
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra flash sale đang bắt đầu: {}", e.getMessage(), e);
        }
    }
} 