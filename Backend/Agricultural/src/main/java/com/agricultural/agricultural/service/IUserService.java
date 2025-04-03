package com.agricultural.agricultural.service;

import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.dto.UserDTO;
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

    String login(String phoneNumber, String password) throws Exception;

    UserDTO updateUser(int id, User newUser);

    void deleteUser(int id);

    UserDTO updateProfileImage(int id, String imageUrl);

    UserDTO uploadAndUpdateProfileImage(int id, MultipartFile file) throws IOException;

    List<UserDTO> getAllUsers();


}
