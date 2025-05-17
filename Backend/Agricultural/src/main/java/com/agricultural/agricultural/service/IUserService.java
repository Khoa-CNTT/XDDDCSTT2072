package com.agricultural.agricultural.service;

import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.dto.UserDTO;
import com.agricultural.agricultural.dto.response.LoginResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface IUserService {

    Optional<UserDTO> findByUserName(String name);

    Optional<User> findByEmail(String email);

    Optional<UserDTO> findById(int id);

    Optional<UserDTO> getUserByEmail(String email);

    boolean existsByEmail(String email);

    User createUser(UserDTO userDTO) throws Exception;
    
    User registerUserWithImage(UserDTO userDTO, MultipartFile image) throws Exception;

    String login(String email, String password) throws Exception;

    LoginResponse loginWithResponse(String email, String password) throws Exception;

    UserDTO updateUser(int id, User newUser);

    UserDTO updateProfileImage(int id, String imageUrl);
    
    UserDTO uploadAndUpdateProfileImage(int id, MultipartFile file) throws IOException;

    void deleteUser(int id);

    List<UserDTO> getAllUsers();
    
    void changePassword(int userId, String currentPassword, String newPassword) throws Exception;

    /**
     * Kiểm tra xem người dùng hiện tại có quyền bán hàng không
     * @return true nếu có quyền bán hàng, false nếu không
     */
    boolean canCurrentUserSell();

    /**
     * Kiểm tra xem người dùng có quyền bán hàng không
     * @param userId ID của người dùng cần kiểm tra
     * @return true nếu có quyền bán hàng, false nếu không
     */
    boolean canUserSell(Integer userId);

    /**
     * Đăng ký làm người bán hàng cho người dùng hiện tại 
     * (yêu cầu phải có gói Premium và sẽ cần admin phê duyệt)
     * @return thông tin yêu cầu đăng ký
     */
    Object registerAsSeller();

}
