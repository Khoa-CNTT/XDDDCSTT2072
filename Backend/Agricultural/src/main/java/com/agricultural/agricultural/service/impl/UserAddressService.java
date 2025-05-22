package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.UserAddressDTO;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.UserAddress;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.UserAddressMapper;
import com.agricultural.agricultural.repository.IUserAddressRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IUserAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserAddressService implements IUserAddressService {
    private final IUserAddressRepository addressRepository;
    private final IUserRepository userRepository;
    private final UserAddressMapper userAddressMapper;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new BadRequestException("Không thể xác thực thông tin người dùng");
        }

        User currentUser = (User) principal;
        if (false) {
            throw new BadRequestException("Không tìm thấy thông tin người dùng");
        }

        return currentUser;
    }

    @Override
    @Transactional
    public UserAddressDTO addAddress(UserAddressDTO addressDTO) {
        if (addressDTO == null) {
            throw new BadRequestException("Thông tin địa chỉ không được để trống");
        }
        
        Integer userId = addressDTO.getUserId();
        if (userId == null) {
            throw new BadRequestException("ID người dùng không được để trống");
        }
        
        if (addressDTO.getAddress() == null || addressDTO.getAddress().trim().isEmpty()) {
            throw new BadRequestException("Địa chỉ không được để trống");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        UserAddress userAddress = userAddressMapper.toEntity(addressDTO);
        userAddress.setUser(user);

        userAddress = addressRepository.save(userAddress);
        return userAddressMapper.toDTO(userAddress);
    }


    @Override
    @Transactional
    public UserAddressDTO updateAddress(int addressId, UserAddressDTO addressDTO) {
        if (addressDTO == null) {
            throw new BadRequestException("Thông tin địa chỉ không được để trống");
        }
        
        if (addressDTO.getAddress() == null || addressDTO.getAddress().trim().isEmpty()) {
            throw new BadRequestException("Địa chỉ không được để trống");
        }
        
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId));

        address.setAddress(addressDTO.getAddress());
        address.setCity(addressDTO.getCity());
        address.setCountry(addressDTO.getCountry());
        address.setPostalCode(addressDTO.getPostalCode());
        // Không thay đổi User

        UserAddress updatedAddress = addressRepository.save(address);
        return userAddressMapper.toDTO(updatedAddress);
    }


    @Override
    @Transactional
    public void deleteAddress(int addressId) {
        if (!addressRepository.existsById(addressId)) {
            throw new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId);
        }
        addressRepository.deleteById(addressId);
    }


    @Override
    public List<UserAddressDTO> getUserAddresses(int userId) {


        // Kiểm tra người dùng có tồn tại không
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }
        
        return addressRepository.findByUserId(userId)
                .stream()
                .map(userAddressMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public UserAddressDTO getAddressById(int addressId) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ với ID: " + addressId));

        return userAddressMapper.toDTO(address);
    }
}
