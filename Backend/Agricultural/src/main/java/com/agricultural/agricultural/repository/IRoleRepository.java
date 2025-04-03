package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface IRoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(String name);
}

