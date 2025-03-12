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
                       PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Override
    public Optional<UserDTO> findById(int id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO); // ✅ Dùng UserMapper để chuyển đổi
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
