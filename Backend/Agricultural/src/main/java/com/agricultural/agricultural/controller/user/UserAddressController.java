package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.UserAddressDTO;
import com.agricultural.agricultural.service.impl.UserAddressService;
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
    private final UserAddressService addressService;

    /**
     * 🟢 Lấy tất cả địa chỉ của user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAddressDTO>> getUserAddresses(@PathVariable int userId) {
        List<UserAddressDTO> addresses = addressService.getUserAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    /**
     * 🟢 Lấy chi tiết một địa chỉ
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAddressById(@PathVariable int id) {
        try {
            UserAddressDTO address = addressService.getAddressById(id);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Address not found with ID: " + id);
        }
    }

    /**
     * 🟢 Thêm địa chỉ mới cho User (Có validation)
     */
    @PostMapping("/user")
    public ResponseEntity<?> addAddress(@Valid @RequestBody UserAddressDTO addressDTO) {
        try {
            UserAddressDTO createdAddress = addressService.addAddress(addressDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAddress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to create address: " + e.getMessage());
        }
    }


    /**
     * 🟢 Cập nhật địa chỉ (Có validation)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable int id, @Valid @RequestBody UserAddressDTO addressDTO) {
        try {
            UserAddressDTO updatedAddress = addressService.updateAddress(id, addressDTO);
            return ResponseEntity.ok(updatedAddress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to update address: " + e.getMessage());
        }
    }

    /**
     * 🟢 Xóa địa chỉ
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable int id) {
        try {
            addressService.deleteAddress(id);
            return ResponseEntity.ok("Địa chỉ đã được xoá thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to delete address: " + e.getMessage());
        }
    }
}
