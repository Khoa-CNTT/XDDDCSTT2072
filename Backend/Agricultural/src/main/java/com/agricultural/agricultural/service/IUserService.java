package com.agricultural.agricultural.service;

import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.dto.UserDTO;

import java.util.List;
import java.util.Optional;

public interface IUserService {

    Optional<UserDTO> findByUserName(String name);

    Optional<User> findByEmail(String email);

    Optional<UserDTO> findById(int id);

    Optional<UserDTO> getUserByEmail(String email);

    boolean existsByEmail(String email);

    User createUser(UserDTO userDTO) throws Exception;

    String login(String phoneNumber, String password) throws Exception;

    UserDTO updateUser(int id, User user);

    void deleteUser(int id);

    List<UserDTO> getAllUsers();


}
