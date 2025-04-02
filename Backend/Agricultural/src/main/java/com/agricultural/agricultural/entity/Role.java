package com.agricultural.agricultural.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity // Đánh dấu lớp Role là JPA entity
@Table(name = "roles")  // Tên bảng trong cơ sở dữ liệu
@Getter
@Setter
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)  // Không cần 'makeFinal' vì có thể muốn sử dụng setter
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "role_name")
    private String name;
    // Getters and Setters

    public String getRoleName() { return name; }


    public static String ADMIN = "ADMIN";
    public static String USER = "USER";

}
