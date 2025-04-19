package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.UserAddressDTO;
import com.agricultural.agricultural.service.IUserAddressService;
import com.agricultural.agricultural.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/user-addresses")
@RequiredArgsConstructor
public class UserAddressController {
    private final IUserAddressService addressService;

    /**
     * Lấy tất cả địa chỉ của người dùng đăng nhập hiện tại
     */
    @GetMapping
    public ResponseEntity<?> getCurrentUserAddresses() {
        try {
            Integer currentUserId = SecurityUtils.getCurrentUserId();
            List<UserAddressDTO> addresses = addressService.getUserAddresses(currentUserId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Không thể lấy thông tin người dùng: " + e.getMessage());
        }
    }

    /**
     * Lấy tất cả địa chỉ của người dùng cụ thể (chỉ admin)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAddresses(@PathVariable int userId) {
        try {
            List<UserAddressDTO> addresses = addressService.getUserAddresses(userId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Không thể lấy địa chỉ: " + e.getMessage());
        }
    }

    /**
     * Lấy thông tin địa chỉ cụ thể theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAddressById(@PathVariable int id) {
        try {
            UserAddressDTO address = addressService.getAddressById(id);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy địa chỉ với ID: " + id);
        }
    }

    /**
     * Thêm địa chỉ mới cho người dùng đăng nhập hiện tại
     */
    @PostMapping
    public ResponseEntity<?> addAddress(@Valid @RequestBody UserAddressDTO addressDTO) {
        try {
            // Lấy ID người dùng hiện tại và set vào DTO
            Integer currentUserId = SecurityUtils.getCurrentUserId();
            addressDTO.setUserId(currentUserId);
            
            UserAddressDTO createdAddress = addressService.addAddress(addressDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAddress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Không thể tạo địa chỉ: " + e.getMessage());
        }
    }

    /**
     * Cập nhật địa chỉ
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable int id, @Valid @RequestBody UserAddressDTO addressDTO) {
        try {
            // Đảm bảo chỉ cập nhật địa chỉ của người dùng hiện tại
            Integer currentUserId = SecurityUtils.getCurrentUserId();
            UserAddressDTO existingAddress = addressService.getAddressById(id);
            
            if (existingAddress.getUserId() != currentUserId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Bạn không có quyền cập nhật địa chỉ này");
            }
            
            addressDTO.setId(id); // Đảm bảo ID được set đúng
            UserAddressDTO updatedAddress = addressService.updateAddress(id, addressDTO);
            return ResponseEntity.ok(updatedAddress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không thể cập nhật địa chỉ: " + e.getMessage());
        }
    }

    /**
     * Xóa địa chỉ
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable int id) {
        try {
            // Đảm bảo chỉ xóa địa chỉ của người dùng hiện tại
            Integer currentUserId = SecurityUtils.getCurrentUserId();
            UserAddressDTO existingAddress = addressService.getAddressById(id);
            
            if (existingAddress.getUserId() != currentUserId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Bạn không có quyền xóa địa chỉ này");
            }
            
            addressService.deleteAddress(id);
            return ResponseEntity.ok("Địa chỉ đã được xóa thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không thể xóa địa chỉ: " + e.getMessage());
        }
    }
}
