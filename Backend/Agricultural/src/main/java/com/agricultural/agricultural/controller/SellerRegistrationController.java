package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.common.SellerRegistrationStatus;
import com.agricultural.agricultural.dto.ResponseDTO;
import com.agricultural.agricultural.dto.SellerRegistrationDTO;
import com.agricultural.agricultural.service.ISellerRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/seller-registrations")
@RequiredArgsConstructor
@Slf4j
public class SellerRegistrationController {

    private final ISellerRegistrationService sellerRegistrationService;

    /**
     * Đăng ký bán hàng
     */
    @PostMapping
    public ResponseEntity<ResponseDTO<SellerRegistrationDTO>> register(@Valid @RequestBody SellerRegistrationDTO registrationDTO) {
        log.info("Nhận yêu cầu đăng ký bán hàng");
        
        SellerRegistrationDTO createdRegistration = sellerRegistrationService.createRegistration(registrationDTO);
        
        ResponseDTO<SellerRegistrationDTO> response = ResponseDTO.<SellerRegistrationDTO>builder()
                .message("Đăng ký bán hàng thành công, đang chờ phê duyệt")
                .data(createdRegistration)
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Lấy trạng thái đăng ký bán hàng mới nhất của người dùng hiện tại
     */
    @GetMapping("/status")
    public ResponseEntity<ResponseDTO<SellerRegistrationDTO>> getStatus() {
        log.info("Nhận yêu cầu lấy trạng thái đăng ký bán hàng");
        
        Optional<SellerRegistrationDTO> registrationOpt = sellerRegistrationService.getCurrentUserLatestRegistration();
        
        if (registrationOpt.isEmpty()) {
            ResponseDTO<SellerRegistrationDTO> response = ResponseDTO.<SellerRegistrationDTO>builder()
                    .message("Bạn chưa đăng ký bán hàng")
                    .data(null)
                    .build();
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        ResponseDTO<SellerRegistrationDTO> response = ResponseDTO.<SellerRegistrationDTO>builder()
                .message("Lấy trạng thái đăng ký bán hàng thành công")
                .data(registrationOpt.get())
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy lịch sử đăng ký bán hàng của người dùng hiện tại
     */
    @GetMapping("/history")
    public ResponseEntity<ResponseDTO<List<SellerRegistrationDTO>>> getHistory() {
        log.info("Nhận yêu cầu lấy lịch sử đăng ký bán hàng");
        
        List<SellerRegistrationDTO> registrations = sellerRegistrationService.getCurrentUserRegistrations();
        
        ResponseDTO<List<SellerRegistrationDTO>> response = ResponseDTO.<List<SellerRegistrationDTO>>builder()
                .message("Lấy lịch sử đăng ký bán hàng thành công")
                .data(registrations)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Kiểm tra người dùng hiện tại có đơn đăng ký đang chờ duyệt không
     */
    @GetMapping("/has-pending")
    public ResponseEntity<ResponseDTO<Boolean>> hasPendingRegistration() {
        log.info("Nhận yêu cầu kiểm tra đơn đăng ký đang chờ duyệt");
        
        boolean hasPending = sellerRegistrationService.hasCurrentUserPendingRegistration();
        
        ResponseDTO<Boolean> response = ResponseDTO.<Boolean>builder()
                .message("Kiểm tra đơn đăng ký đang chờ duyệt thành công")
                .data(hasPending)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Kiểm tra người dùng hiện tại đã được phê duyệt bán hàng chưa
     */
    @GetMapping("/is-approved")
    public ResponseEntity<ResponseDTO<Boolean>> isApproved() {
        log.info("Nhận yêu cầu kiểm tra trạng thái phê duyệt bán hàng");
        
        boolean isApproved = sellerRegistrationService.hasCurrentUserApprovedRegistration();
        
        ResponseDTO<Boolean> response = ResponseDTO.<Boolean>builder()
                .message("Kiểm tra trạng thái phê duyệt bán hàng thành công")
                .data(isApproved)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    // ADMIN ENDPOINTS
    
    /**
     * Lấy tất cả đơn đăng ký bán hàng (chỉ admin)
     */
    @GetMapping
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ResponseDTO<List<SellerRegistrationDTO>>> getAllRegistrations() {
        log.info("Admin yêu cầu lấy tất cả đơn đăng ký bán hàng");
        
        List<SellerRegistrationDTO> registrations = sellerRegistrationService.getAllRegistrations();
        
        ResponseDTO<List<SellerRegistrationDTO>> response = ResponseDTO.<List<SellerRegistrationDTO>>builder()
                .message("Lấy tất cả đơn đăng ký bán hàng thành công")
                .data(registrations)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy đơn đăng ký bán hàng theo trạng thái (chỉ admin)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ResponseDTO<List<SellerRegistrationDTO>>> getRegistrationsByStatus(@PathVariable String status) {
        log.info("Admin yêu cầu lấy đơn đăng ký bán hàng theo trạng thái: {}", status);
        
        List<SellerRegistrationDTO> registrations = sellerRegistrationService.getRegistrationsByStatus(status);
        
        ResponseDTO<List<SellerRegistrationDTO>> response = ResponseDTO.<List<SellerRegistrationDTO>>builder()
                .message("Lấy đơn đăng ký bán hàng theo trạng thái thành công")
                .data(registrations)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Phê duyệt đơn đăng ký bán hàng (chỉ admin)
     */
    @PutMapping("/approve/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ResponseDTO<SellerRegistrationDTO>> approveRegistration(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        log.info("Admin yêu cầu phê duyệt đơn đăng ký bán hàng với ID: {}", id);
        
        String notes = body != null ? body.get("notes") : null;
        
        SellerRegistrationDTO updatedRegistration = sellerRegistrationService.approveRegistration(id, notes);
        
        ResponseDTO<SellerRegistrationDTO> response = ResponseDTO.<SellerRegistrationDTO>builder()
                .message("Phê duyệt đơn đăng ký bán hàng thành công")
                .data(updatedRegistration)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Từ chối đơn đăng ký bán hàng (chỉ admin)
     */
    @PutMapping("/reject/{id}")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<ResponseDTO<SellerRegistrationDTO>> rejectRegistration(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        log.info("Admin yêu cầu từ chối đơn đăng ký bán hàng với ID: {}", id);
        
        // Yêu cầu phải có lý do từ chối
        if (body == null || body.get("notes") == null || body.get("notes").trim().isEmpty()) {
            ResponseDTO<SellerRegistrationDTO> errorResponse = ResponseDTO.<SellerRegistrationDTO>builder()
                    .message("Vui lòng cung cấp lý do từ chối")
                    .data(null)
                    .build();
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        String notes = body.get("notes");
        
        SellerRegistrationDTO updatedRegistration = sellerRegistrationService.rejectRegistration(id, notes);
        
        ResponseDTO<SellerRegistrationDTO> response = ResponseDTO.<SellerRegistrationDTO>builder()
                .message("Từ chối đơn đăng ký bán hàng thành công")
                .data(updatedRegistration)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Kiểm tra một người dùng cụ thể đã được phê duyệt bán hàng chưa
     */
    @GetMapping("/user/{userId}/is-approved")
    public ResponseEntity<ResponseDTO<Boolean>> isUserApproved(@PathVariable Integer userId) {
        log.info("Nhận yêu cầu kiểm tra trạng thái phê duyệt bán hàng của người dùng: {}", userId);
        
        boolean isApproved = sellerRegistrationService.hasUserApprovedRegistration(userId);
        
        ResponseDTO<Boolean> response = ResponseDTO.<Boolean>builder()
                .message("Kiểm tra trạng thái phê duyệt bán hàng thành công")
                .data(isApproved)
                .build();
        
        return ResponseEntity.ok(response);
    }
} 