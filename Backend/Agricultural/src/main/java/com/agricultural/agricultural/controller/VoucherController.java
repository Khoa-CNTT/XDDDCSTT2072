package com.agricultural.agricultural.controller;

import com.agricultural.agricultural.dto.VoucherDTO;
import com.agricultural.agricultural.entity.Voucher;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.IVoucherRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final IVoucherRepository voucherRepository;
    private final IUserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<VoucherDTO>> getAllVouchers() {
        List<Voucher> vouchers = voucherRepository.findAllActiveVouchers(LocalDateTime.now());
        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(voucherDTOs);
    }

    @GetMapping("/platform")
    public ResponseEntity<List<VoucherDTO>> getPlatformVouchers() {
        List<Voucher> vouchers = voucherRepository.findAllActivePlatformVouchers(LocalDateTime.now());
        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(voucherDTOs);
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<VoucherDTO>> getShopVouchers(@PathVariable Integer shopId) {
        List<Voucher> vouchers = voucherRepository.findAllActiveShopVouchers(LocalDateTime.now(), shopId);
        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(voucherDTOs);
    }

    @GetMapping("/shipping")
    public ResponseEntity<List<VoucherDTO>> getShippingVouchers() {
        List<Voucher> vouchers = voucherRepository.findAllActiveShippingVouchers(LocalDateTime.now());
        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(voucherDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherDTO> getVoucherById(@PathVariable Integer id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với ID: " + id));
        return ResponseEntity.ok(convertToDTO(voucher));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<VoucherDTO> getVoucherByCode(@PathVariable String code) {
        Voucher voucher = voucherRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với mã: " + code));
        
        if (!voucher.isValid()) {
            throw new BadRequestException("Voucher đã hết hạn hoặc đã hết lượt sử dụng");
        }
        
        return ResponseEntity.ok(convertToDTO(voucher));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherDTO> createVoucher(@RequestBody VoucherDTO voucherDTO) {
        // Kiểm tra code đã tồn tại chưa
        if (voucherRepository.findByCodeAndIsActiveTrue(voucherDTO.getCode()).isPresent()) {
            throw new BadRequestException("Mã voucher đã tồn tại: " + voucherDTO.getCode());
        }
        
        // Nếu là voucher shop, kiểm tra xem shopId có tồn tại trong bảng User không
        if ("SHOP".equals(voucherDTO.getType()) && voucherDTO.getShopId() != null) {
            Optional<User> user = userRepository.findById(voucherDTO.getShopId());
            if (!user.isPresent()) {
                throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + voucherDTO.getShopId());
            }
            // Cập nhật shopName từ User
            voucherDTO.setShopName(user.get().getUsername());
        }
        
        Voucher voucher = convertToEntity(voucherDTO);
        Voucher savedVoucher = voucherRepository.save(voucher);
        return new ResponseEntity<>(convertToDTO(savedVoucher), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherDTO> updateVoucher(@PathVariable Integer id, @RequestBody VoucherDTO voucherDTO) {
        Voucher existingVoucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với ID: " + id));
        
        // Nếu là voucher shop và shopId đã thay đổi, kiểm tra user
        if ("SHOP".equals(voucherDTO.getType()) && voucherDTO.getShopId() != null && 
            !voucherDTO.getShopId().equals(existingVoucher.getShopId())) {
            Optional<User> user = userRepository.findById(voucherDTO.getShopId());
            if (!user.isPresent()) {
                throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + voucherDTO.getShopId());
            }
            // Cập nhật shopName từ User
            voucherDTO.setShopName(user.get().getUsername());
            existingVoucher.setShopId(voucherDTO.getShopId());
            existingVoucher.setShopName(voucherDTO.getShopName());
        }
        
        // Cập nhật thông tin
        existingVoucher.setName(voucherDTO.getName());
        existingVoucher.setDescription(voucherDTO.getDescription());
        existingVoucher.setDiscountAmount(voucherDTO.getDiscountAmount());
        existingVoucher.setMinOrderAmount(voucherDTO.getMinOrderAmount());
        existingVoucher.setMaxDiscountAmount(voucherDTO.getMaxDiscountAmount());
        existingVoucher.setStartDate(voucherDTO.getStartDate());
        existingVoucher.setEndDate(voucherDTO.getEndDate());
        existingVoucher.setIsActive(voucherDTO.getIsActive());
        existingVoucher.setIsShippingVoucher(voucherDTO.getIsShippingVoucher());
        existingVoucher.setShippingDiscountAmount(voucherDTO.getShippingDiscountAmount());
        existingVoucher.setMinShippingFee(voucherDTO.getMinShippingFee());
        
        Voucher updatedVoucher = voucherRepository.save(existingVoucher);
        return ResponseEntity.ok(convertToDTO(updatedVoucher));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Integer id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với ID: " + id));
        
        // Thay vì xóa, chỉ cập nhật trạng thái không hoạt động
        voucher.setIsActive(false);
        voucherRepository.save(voucher);
        
        return ResponseEntity.noContent().build();
    }

    private VoucherDTO convertToDTO(Voucher voucher) {
        return VoucherDTO.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountAmount(voucher.getDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .isActive(voucher.getIsActive())
                .type(voucher.getType())
                .shopId(voucher.getShopId())
                .shopName(voucher.getShopName())
                .usageLimit(voucher.getUsageLimit())
                .usageCount(voucher.getUsageCount())
                .isShippingVoucher(voucher.getIsShippingVoucher())
                .shippingDiscountAmount(voucher.getShippingDiscountAmount())
                .minShippingFee(voucher.getMinShippingFee())
                .build();
    }
    
    private Voucher convertToEntity(VoucherDTO dto) {
        return Voucher.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .type(dto.getType())
                .discountAmount(dto.getDiscountAmount())
                .minOrderAmount(dto.getMinOrderAmount())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .isActive(dto.getIsActive())
                .shopId(dto.getShopId())
                .shopName(dto.getShopName())
                .usageLimit(dto.getUsageLimit())
                .usageCount(dto.getUsageCount() != null ? dto.getUsageCount() : 0)
                .isShippingVoucher(dto.getIsShippingVoucher())
                .shippingDiscountAmount(dto.getShippingDiscountAmount())
                .minShippingFee(dto.getMinShippingFee())
                .build();
    }
} 