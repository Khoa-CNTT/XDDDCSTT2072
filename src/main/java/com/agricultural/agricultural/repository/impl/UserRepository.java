package com.agricultural.agricultural.repository.impl;

import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.repository.IUserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {
    @Autowired
    private IUserRepository userRepository;

    // Phương thức tùy chỉnh
//    public List<User> findByUserName(String name) {
//        return userRepository.findByUserName(name);
//    }

    public Optional<User> findByUserName(String name) {
        return userRepository.findByUserName(name);
    }



    public Optional<User> findByEmail(String email) {
        System.out.println("Finding user by email: " + email);
        return userRepository.findByEmail(email);
    }


    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void deleteById(int id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id " + id);
        }
        userRepository.deleteById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email) > 0;
    }


//    public boolean existsById(Integer userId) {
//    }
}
