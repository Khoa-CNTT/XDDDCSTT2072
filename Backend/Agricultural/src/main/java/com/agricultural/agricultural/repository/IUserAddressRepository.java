package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUserAddressRepository extends JpaRepository<UserAddress, Integer> {
    List<UserAddress> findByUserId(int userId);
}
