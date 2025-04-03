package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.UserDTO;
import com.agricultural.agricultural.entity.Role;
import com.agricultural.agricultural.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(source = "username", target = "userName") // ✅ Chắc chắn ánh xạ userName
    @Mapping(source = "role", target = "roleName", qualifiedByName = "mapRoleName") // ✅ Sửa lại
    UserDTO toDTO(User user);

    @Mapping(target = "role", ignore = true) // Vì role không có sẵn trong DTO
    User toEntity(UserDTO userDTO);

    // ✅ Định nghĩa phương thức ánh xạ role → roleName
    @Named("mapRoleName")
    default String mapRoleName(Role role) {
        return (role != null) ? role.getName() : "UNKNOWN";
    }
}
