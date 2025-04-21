package com.agricultural.agricultural.controller.user;

import com.agricultural.agricultural.dto.response.ErrorResponse;
import com.agricultural.agricultural.dto.LoginDTO;
import com.agricultural.agricultural.dto.response.LoginResponse;
import com.agricultural.agricultural.dto.UserDTO;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.mapper.UserMapper;
import com.agricultural.agricultural.service.impl.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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




    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers()); // ✅ UserService đã sử dụng Mapper
    }


    @GetMapping("/email")
    public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
        Optional<UserDTO> userDTO = userService.getUserByEmail(email);
        return userDTO.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((UserDTO) Map.of("error", "User not found with email: " + email)));
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @Valid @RequestBody UserDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        User userToUpdate = userMapper.toEntity(userDTO); // ✅ Dùng Mapper để chuyển đổi DTO → Entity
        UserDTO updatedUser = userService.updateUser(id, userToUpdate);
        return ResponseEntity.ok(updatedUser);
    }


    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable int id,
            @RequestParam("image") MultipartFile file) {
        try {
            // Gọi service để xử lý việc upload ảnh
            UserDTO updatedUser = userService.uploadAndUpdateProfileImage(id, file);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể upload ảnh: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

//    /**
//     * Đăng ký tài khoản người dùng
//     */
//    @PostMapping("/register")
//    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO, BindingResult result) {
//        if (result.hasErrors()) {
//            return ResponseEntity.badRequest().body(getValidationErrors(result));
//        }
//
//        try {
//            User newUser = userService.createUser(userDTO);
//            return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDTO(newUser)); // ✅ Dùng Mapper để chuyển đổi
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        }
//    }


    @PostMapping(value = "/register-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createUserWithImage(
            @Valid @ModelAttribute UserDTO userDTO,
            @RequestPart(value = "image", required = false) MultipartFile image,
            BindingResult result) {
        
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        try {
            User newUser = userService.registerUserWithImage(userDTO, image);
            return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDTO(newUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể upload ảnh: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO userLoginDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        try {
            LoginResponse loginResponse = userService.loginWithResponse(
                userLoginDTO.getEmail(), 
                userLoginDTO.getPassword()
            );
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ErrorResponse.builder()
                    .error(true)
                    .message(e.getMessage())
                    .build()
            );
        }
    }


    private Map<String, String> getValidationErrors(BindingResult result) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : result.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return errors;
    }
}
