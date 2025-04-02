package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.domain.entity.User;
import com.agricultural.agricultural.dto.UserDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-01T16:21:07+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setUserName( user.getUsername() );
        userDTO.setRoleName( mapRoleName( user.getRole() ) );
        userDTO.setId( user.getId() );
        userDTO.setPassword( user.getPassword() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setPhone( user.getPhone() );
        userDTO.setImageUrl( user.getImageUrl() );

        return userDTO;
    }

    @Override
    public User toEntity(UserDTO userDTO) {
        if ( userDTO == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( userDTO.getId() );
        user.userName( userDTO.getUserName() );
        user.password( userDTO.getPassword() );
        user.email( userDTO.getEmail() );
        user.phone( userDTO.getPhone() );
        user.imageUrl( userDTO.getImageUrl() );

        return user.build();
    }
}
