package com.agricultural.agricultural.service.impl;
import com.agricultural.agricultural.entity.Role;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.components.JwtTokenUtil;
import com.agricultural.agricultural.dto.UserDTO;
import com.agricultural.agricultural.exception.DataNotFoundException;
import com.agricultural.agricultural.exception.PermissionDenyException;
import com.agricultural.agricultural.mapper.UserMapper;
import com.agricultural.agricultural.repository.IRoleRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IUserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService implements IUserService {

    AuthenticationManager authenticationManager;
    IRoleRepository roleRepository;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    JwtTokenUtil jwtTokenUtil;
    UserMapper userMapper;

    @Autowired
    public UserService(UserMapper userMapper, AuthenticationManager authenticationManager,
                       IRoleRepository roleRepository, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil,
                       UploadUtils uploadUtils) {
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.uploadUtils = uploadUtils;
    }

    @Override
    public Optional<UserDTO> findById(int id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO);
    }


    @Override
    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(userMapper::toDTO);
    }


    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User createUser(UserDTO userDTO) throws Exception {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new DataIntegrityViolationException("Email already exists");
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new DataNotFoundException("Role not found"));

        if (role.getName().equalsIgnoreCase("ADMIN")) {
            throw new PermissionDenyException("You cannot register an admin account");
        }

        // Sử dụng Mapper để chuyển đổi DTO -> Entity
        User newUser = userMapper.toEntity(userDTO);
        newUser.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Mã hóa mật khẩu
        newUser.setRole(role); // Gán Role

        // Thêm imageUrl nếu có
        if (userDTO.getImageUrl() != null && !userDTO.getImageUrl().isEmpty()) {
            newUser.setImageUrl(userDTO.getImageUrl());
        }

        return userRepository.save(newUser);
    }

    @Override
    public String login(String email, String password) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new DataNotFoundException("Invalid email / password");
        }

        User existingUser = optionalUser.get();
        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException("Wrong email or password");
        }

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                email, password, existingUser.getAuthorities()
        );

        authenticationManager.authenticate(authenticationToken);
        return jwtTokenUtil.generateToken(existingUser);
    }

    @Override
    public User registerUserWithImage(UserDTO userDTO, MultipartFile image) throws Exception {
        if (image == null || image.isEmpty()) {
            return createUser(userDTO);
        }

        // Kiểm tra định dạng file
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh");
        }

        // Upload ảnh lên Cloudinary
        Map uploadResult = uploadUtils.uploadImage(image);
        String imageUrl = (String) uploadResult.get("secure_url");
        userDTO.setImageUrl(imageUrl);

        // Tạo user với ảnh đại diện
        return createUser(userDTO);
    }

    @Override
    public UserDTO updateUser(int id, User newUser) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    // Cập nhật thông tin User từ DTO
                    existingUser.setUserName(newUser.getUsername());
                    existingUser.setEmail(newUser.getEmail());
                    existingUser.setPhone(newUser.getPhone());

                    if (newUser.getPassword() != null && !newUser.getPassword().isEmpty()) {
                        existingUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
                    }

                    if (newUser.getRole() != null) {
                        existingUser.setRole(newUser.getRole());
                    }

                    return userMapper.toDTO(userRepository.save(existingUser));
                })
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + id));
    }

    @Override
    public UserDTO updateProfileImage(int id, String imageUrl) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setImageUrl(imageUrl);
                    return userMapper.toDTO(userRepository.save(existingUser));
                })
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + id));
    }


    @Override
    public UserDTO uploadAndUpdateProfileImage(int id, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn file ảnh");
        }

        // Kiểm tra định dạng file
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh");
        }

        // Upload ảnh lên Cloudinary
        Map uploadResult = uploadUtils.uploadImage(file);
        String imageUrl = (String) uploadResult.get("secure_url");

        // Cập nhật ảnh cho user
        return updateProfileImage(id, imageUrl);
    }

    @Override
    public Optional<UserDTO> findByUserName(String name) {
        return userRepository.findByUserName(name)
                .map(userMapper::toDTO); // ✅ Dùng Mapper để chuyển đổi Entity → DTO
    }


    @Override
    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
}
