package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IUserAddressRepository extends JpaRepository<UserAddress, Integer> {
    List<UserAddress> findByUserId(int userId);
}
