package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.UserAddressDTO;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.UserAddress;
import com.agricultural.agricultural.mapper.UserAddressMapper;
import com.agricultural.agricultural.repository.IUserAddressRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IUserAddressService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAddressService implements IUserAddressService {
    private final IUserAddressRepository addressRepository;
    private final IUserRepository userRepository;
    private final UserAddressMapper userAddressMapper;

    /**
     * Thêm địa chỉ mới cho User
     */
    @Override
    public UserAddressDTO addAddress(UserAddressDTO addressDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOptional = userRepository.findByUserName(username);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        UserAddress userAddress = userAddressMapper.toEntity(addressDTO);
        userAddress.setUser(user); // Gán user vào entity

        userAddress = addressRepository.save(userAddress); // Lưu vào database

        return userAddressMapper.toDTO(userAddress); // Trả về DTO đúng ID
    }



    /**
     * Cập nhật địa chỉ
     */
    @Override
    public UserAddressDTO updateAddress(int addressId, UserAddressDTO addressDTO) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        // Cập nhật thông tin địa chỉ
        address.setAddress(addressDTO.getAddress());
        address.setCity(addressDTO.getCity());
        address.setCountry(addressDTO.getCountry());
        address.setPostalCode(addressDTO.getPostalCode());

        UserAddress updatedAddress = addressRepository.save(address);
        return userAddressMapper.toDTO(updatedAddress);
    }

    /**
     * Xóa địa chỉ theo ID
     */
    @Override
    public void deleteAddress(int addressId) {
        if (!addressRepository.existsById(addressId)) {
            throw new EntityNotFoundException("Address not found");
        }
        addressRepository.deleteById(addressId);
    }

    /**
     * Lấy tất cả địa chỉ của User
     */
    @Override
    public List<UserAddressDTO> getUserAddresses(int userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(userAddressMapper::toDTO) // ✅ Dùng Mapper để chuyển đổi
                .collect(Collectors.toList());
    }

    /**
     * Lấy địa chỉ theo ID
     */
    @Override
    public UserAddressDTO getAddressById(int addressId) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        return userAddressMapper.toDTO(address);
    }
}
