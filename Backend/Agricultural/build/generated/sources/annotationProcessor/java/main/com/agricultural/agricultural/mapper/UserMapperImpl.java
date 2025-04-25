package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.UserDTO;
import com.agricultural.agricultural.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-25T13:07:06+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO.UserDTOBuilder userDTO = UserDTO.builder();

        userDTO.userName( user.getUsername() );
        userDTO.roleName( mapRoleName( user.getRole() ) );
        userDTO.imageUrl( user.getImageUrl() );
        userDTO.id( user.getId() );
        userDTO.email( user.getEmail() );
        userDTO.phone( user.getPhone() );

        return userDTO.build();
    }

    @Override
    public User toEntity(UserDTO userDTO) {
        if ( userDTO == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.userName( userDTO.getUserName() );
        user.id( userDTO.getId() );
        user.password( userDTO.getPassword() );
        user.email( userDTO.getEmail() );
        user.phone( userDTO.getPhone() );
        user.imageUrl( userDTO.getImageUrl() );

        return user.build();
    }
}
