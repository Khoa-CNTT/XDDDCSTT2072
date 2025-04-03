package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.LoginDTO;
import com.agricultural.agricultural.dto.UserDTO;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.mapper.UserMapper;
import com.agricultural.agricultural.service.impl.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    /**
     * Lấy thông tin người dùng theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((UserDTO) Map.of("error", "User not found with ID: " + id)));
    }

    @GetMapping("/findByName")
    public ResponseEntity<?> findUserByName(@RequestParam String name) {
        return userService.findByUserName(name)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((UserDTO) Map.of("error", "User not found with name: " + name)));
    }



    /**
     * Lấy danh sách tất cả người dùng
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers()); // ✅ UserService đã sử dụng Mapper
    }

    /**
     * Tìm kiếm người dùng theo email
     */
    @GetMapping("/email")
    public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
        Optional<UserDTO> userDTO = userService.getUserByEmail(email);
        return userDTO.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((UserDTO) Map.of("error", "User not found with email: " + email)));
    }

    /**
     * Cập nhật thông tin người dùng
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @Valid @RequestBody UserDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        User userToUpdate = userMapper.toEntity(userDTO); // ✅ Dùng Mapper để chuyển đổi DTO → Entity
        UserDTO updatedUser = userService.updateUser(id, userToUpdate);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Xóa người dùng theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Đăng ký tài khoản người dùng
     */
    @PostMapping("/register")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        try {
            User newUser = userService.createUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDTO(newUser)); // ✅ Dùng Mapper để chuyển đổi
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Đăng nhập và trả về JWT Token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO userLoginDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        try {
            String token = userService.login(userLoginDTO.getEmail(), userLoginDTO.getPassword());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Xử lý lỗi validation
     */
    private Map<String, String> getValidationErrors(BindingResult result) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : result.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return errors;
    }
}
