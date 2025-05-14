package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.entity.RefreshToken;
import com.agricultural.agricultural.entity.Role;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.components.JwtTokenUtil;
import com.agricultural.agricultural.dto.response.LoginResponse;
import com.agricultural.agricultural.dto.UserDTO;
import com.agricultural.agricultural.exception.BusinessException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.UserMapper;
import com.agricultural.agricultural.repository.IRoleRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IRefreshTokenService;
import com.agricultural.agricultural.service.IUserService;
import com.agricultural.agricultural.utils.UploadUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserService implements IUserService {

    @Value("${jwt.expiration:3600}")
    private long jwtExpiration;

    private final AuthenticationManager authenticationManager;
    private final IRoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserMapper userMapper;
    private final UploadUtils uploadUtils;
    private final IRefreshTokenService refreshTokenService;

    @Autowired
    public UserService(UserMapper userMapper, AuthenticationManager authenticationManager,
                       IRoleRepository roleRepository, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil,
                       UploadUtils uploadUtils, IRefreshTokenService refreshTokenService) {
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.uploadUtils = uploadUtils;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    public Optional<UserDTO> findById(int id) {
        System.out.println("Tìm người dùng với ID: " + id);
        Optional<User> userOptional = userRepository.findById(id);
        
        if (userOptional.isPresent()) {
            System.out.println("Tìm thấy người dùng: " + userOptional.get().getUsername());
            return userOptional.map(userMapper::toDTO);
        } else {
            System.out.println("Không tìm thấy người dùng với ID: " + id);
            return Optional.empty();
        }
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
            throw new BusinessException("Email đã tồn tại");
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role USER"));

        if (role.getName().equalsIgnoreCase("ADMIN")) {
            throw new BusinessException("Bạn không thể đăng ký tài khoản ADMIN");
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
    public String login(String email, String password) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new ResourceNotFoundException("Sai email hoặc password");
        }

        User existingUser = optionalUser.get();
        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException("Sai email hoặc password");
        }

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                email, password, existingUser.getAuthorities()
        );

        authenticationManager.authenticate(authenticationToken);
        return jwtTokenUtil.generateToken(existingUser);
    }

    @Override
    public LoginResponse loginWithResponse(String email, String password) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new ResourceNotFoundException("Sai email hoặc password");
        }

        User existingUser = optionalUser.get();
        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException("Sai email hoặc password");
        }

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                email, password, existingUser.getAuthorities()
        );

        authenticationManager.authenticate(authenticationToken);
        
        // Generate JWT token
        String accessToken = jwtTokenUtil.generateToken(existingUser);
        
        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(existingUser.getId());
        
        // Map user to DTO
        UserDTO userDTO = userMapper.toDTO(existingUser);
        
        // Create response
        return LoginResponse.builder()
                .message("Đăng nhập thành công")
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresAt(Instant.now().plusSeconds(jwtExpiration))
                .user(userDTO)
                .build();
    }

    @Override
    public UserDTO updateUser(int id, User newUser) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    // Cập nhật thông tin User từ DTO
                    existingUser.setUserName(newUser.getUsername());
                    existingUser.setEmail(newUser.getEmail());
                    existingUser.setPhone(newUser.getPhone());

                    // Kiểm tra để xử lý cập nhật mật khẩu
                    if (newUser.getPassword() != null && !newUser.getPassword().isEmpty() && 
                        !newUser.getPassword().equals("********")) {
                        // Nếu có mật khẩu mới thì mã hóa và cập nhật
                        existingUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
                    }
                    // Trường hợp keepExistingPassword = true hoặc mật khẩu là dấu sao thì giữ nguyên mật khẩu hiện tại

                    if (newUser.getRole() != null) {
                        existingUser.setRole(newUser.getRole());
                    }

                    // Cập nhật imageUrl nếu có
                    if (newUser.getImageUrl() != null && !newUser.getImageUrl().isEmpty()) {
                        existingUser.setImageUrl(newUser.getImageUrl());
                    }

                    return userMapper.toDTO(userRepository.save(existingUser));
                })
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại với id : " + id));
    }


    @Override
    public UserDTO updateProfileImage(int id, String imageUrl) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setImageUrl(imageUrl);
                    return userMapper.toDTO(userRepository.save(existingUser));
                })
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại với id : " + id));
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

    @Override
    public void changePassword(int userId, String currentPassword, String newPassword) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại với id: " + userId));
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không đúng");
        }
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
