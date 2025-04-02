package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.UserAddressDTO;
import com.agricultural.agricultural.entity.UserAddress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserAddressMapper {
    UserAddressMapper INSTANCE = Mappers.getMapper(UserAddressMapper.class);

    // Chuyển từ UserAddress -> UserAddressDTO
    @Mapping(source = "user.id", target = "userId") // ✅ `userId` có trong UserAddressDTO
    UserAddressDTO toDTO(UserAddress userAddress);

    // Chuyển từ UserAddressDTO -> UserAddress (Bỏ qua user, user sẽ được set ở Service)
    @Mapping(target = "user", ignore = true)
    UserAddress toEntity(UserAddressDTO userAddressDTO);
}

