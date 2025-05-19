package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.components.JwtTokenUtil;
import com.agricultural.agricultural.dto.response.LoginResponse;
import com.agricultural.agricultural.entity.RefreshToken;
import com.agricultural.agricultural.entity.Role;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.UserMapper;
import com.agricultural.agricultural.repository.IRoleRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IGoogleService;
import com.agricultural.agricultural.service.IRefreshTokenService;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class GoogleService implements IGoogleService {
    private static final Logger logger = Logger.getLogger(GoogleService.class.getName());
    
    private final UserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserMapper userMapper;
    private final IRefreshTokenService refreshTokenService;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    // Danh sách các Google Client ID được tin cậy
    private static final List<String> TRUSTED_CLIENT_IDS = Arrays.asList(
            "469623797523-qt6oe9phdosugdpot30jdulatp7umsvm.apps.googleusercontent.com",  // Client ID từ cấu hình hiện tại
            "469623797523-2i2fne97posh1c7hgn66tn1fukl69rhn.apps.googleusercontent.com"   // Client ID cũ 
    );

    @Override
    public LoginResponse loginWithGoogle(String idToken) throws Exception {
        try {
            logger.info("Đang xử lý đăng nhập Google với token: " + (idToken != null ? idToken.substring(0, Math.min(idToken.length(), 20)) + "..." : "null"));
            
            // Thêm log để debug Client ID từ cấu hình
            logger.info("Configured Google client ID: " + googleClientId);
            logger.info("Đang thử xác thực với danh sách Client ID: " + TRUSTED_CLIENT_IDS);
            
            // Xác thực token ID từ Google - chấp nhận nhiều Client IDs
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    GsonFactory.getDefaultInstance())
                    .setAudience(TRUSTED_CLIENT_IDS)
                    .build();
            
            // Xác thực token
            GoogleIdToken googleIdToken = null;
            try {
                googleIdToken = verifier.verify(idToken);
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Lỗi khi xác thực token: " + e.getMessage(), e);
            }
            
            if (googleIdToken == null) {
                logger.severe("Token Google không hợp lệ hoặc không thể xác thực");
                
                // Thử phân tích token để kiểm tra
                try {
                    GoogleIdToken parsedToken = GoogleIdToken.parse(GsonFactory.getDefaultInstance(), idToken);
                    GoogleIdToken.Payload payload = parsedToken.getPayload();
                    logger.info("Thông tin token đã parse: Audience=" + payload.getAudience() + ", Email=" + payload.getEmail());
                } catch (Exception e) {
                    logger.log(Level.SEVERE, "Không thể phân tích token: " + e.getMessage(), e);
                }
                
                throw new ResourceNotFoundException("Token Google không hợp lệ hoặc không thể xác thực");
            }
    
            // Lấy thông tin từ token
            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            
            logger.info("Đã xác thực thành công token Google cho email: " + email);
            
            if (email == null) {
                logger.severe("Email không tồn tại trong token Google");
                throw new ResourceNotFoundException("Email không tồn tại trong token Google");
            }
            
            // Kiểm tra và log thông tin từ token
            logTokenInfo(payload);
            
            // Kiểm tra xem người dùng đã tồn tại trong hệ thống chưa
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        // Nếu chưa tồn tại, tạo người dùng mới
                        logger.info("Tạo người dùng mới từ Google login cho email: " + email);
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setUserName((String) payload.get("name"));
                        
                        // Tạo mật khẩu ngẫu nhiên
                        String randomPassword = UUID.randomUUID().toString();
                        newUser.setPassword(passwordEncoder.encode(randomPassword));
                        
                        // Lấy URL ảnh đại diện từ Google nếu có
                        String pictureUrl = (String) payload.get("picture");
                        if (pictureUrl != null) {
                            newUser.setImageUrl(pictureUrl);
                        }
                        
                        // Gán vai trò USER
                        Role userRole = roleRepository.findByName("USER")
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò USER"));
                        newUser.setRole(userRole);
                        
                        return userRepository.save(newUser);
                    });
            
            // Tạo JWT token
            String token = jwtTokenUtil.generateToken(user);
            
            // Tạo refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            
            logger.info("Đăng nhập Google thành công cho user: " + user.getId());
            
            // Tạo response
            return LoginResponse.builder()
                    .message("Đăng nhập bằng Google thành công")
                    .token(token)
                    .refreshToken(refreshToken.getToken())
                    .tokenType("Bearer")
                    .expiresAt(Instant.now().plusSeconds(jwtExpiration/1000))
                    .user(userMapper.toDTO(user))
                    .build();
        } catch (Exception e) {
            logger.severe("Lỗi xử lý đăng nhập Google: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Ghi log thông tin từ token để debug
     */
    private void logTokenInfo(GoogleIdToken.Payload payload) {
        logger.info("=== Google Token Info ===");
        logger.info("Email: " + payload.getEmail());
        logger.info("Email Verified: " + payload.getEmailVerified());
        logger.info("Name: " + payload.get("name"));
        logger.info("Picture: " + payload.get("picture"));
        logger.info("Locale: " + payload.get("locale"));
        logger.info("Subject (Google ID): " + payload.getSubject());
        logger.info("Audience: " + payload.getAudience());
        logger.info("Authorized Party: " + payload.getAuthorizedParty());
        logger.info("Issued At: " + new java.util.Date(payload.getIssuedAtTimeSeconds() * 1000));
        logger.info("Expires At: " + new java.util.Date(payload.getExpirationTimeSeconds() * 1000));
        logger.info("=========================");
    }
} 