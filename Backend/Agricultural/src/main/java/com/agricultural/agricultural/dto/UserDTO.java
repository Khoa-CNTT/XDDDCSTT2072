package com.agricultural.agricultural.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private int id;
    private String userName;
    private String email;
    private String password;
    private String phone;
    private String roleName;
    private String imageUrl;
}

