package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IUserRepository extends JpaRepository<User, Integer> {
    // Đây là phương thức tùy chỉnh bạn có thể thêm vào
    @Query("SELECT u FROM User u WHERE LOWER(u.userName) LIKE LOWER(CONCAT('%', :name, '%'))")
//    List<User> findByUserName(String name);
    Optional<User> findByUserName(String name);


    Optional<User> findById(int id);
    Optional<User> findByEmail(String email);
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email")
    long existsByEmail(@Param("email") String email);

}
