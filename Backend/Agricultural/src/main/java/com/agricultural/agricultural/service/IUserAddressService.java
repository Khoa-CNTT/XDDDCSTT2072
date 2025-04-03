package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.UserAddressDTO;

import java.util.List;

public interface IUserAddressService {
    UserAddressDTO addAddress(UserAddressDTO addressDTO);

    UserAddressDTO updateAddress(int addressId, UserAddressDTO addressDTO);

    void deleteAddress(int addressId);

    List<UserAddressDTO> getUserAddresses(int userId);

    UserAddressDTO getAddressById(int addressId);
}
