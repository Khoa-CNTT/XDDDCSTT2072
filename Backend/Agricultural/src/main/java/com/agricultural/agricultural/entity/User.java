package com.agricultural.agricultural.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Thông tin người dùng - Lưu trữ thông tin người dùng trong hệ thống
 * Kế thừa từ UserDetails của Spring Security để hỗ trợ xác thực và phân quyền
 */
@Builder
@Entity
@Table(name = "users")
@RequiredArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "authorities"})
@AllArgsConstructor
public class User extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Tên đăng nhập của người dùng
     */
    @Column(name = "username", nullable = false, length = 50)
    private String userName;

    /**
     * Mật khẩu đã được mã hóa của người dùng
     */
    @Column(nullable = false, length = 255)
    private String password;

    /**
     * Địa chỉ email của người dùng, phải là duy nhất trong hệ thống
     */
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    /**
     * Số điện thoại của người dùng, hỗ trợ cả định dạng quốc tế
     */
    @Column(length = 20)
    private String phone;

    /**
     * URL ảnh đại diện của người dùng
     */
    @Column(name = "image_url", length = 255)
    private String imageUrl;

    /**
     * Vai trò của người dùng trong hệ thống (ADMIN, USER, SELLER,...)
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", referencedColumnName = "id")
    @JsonIgnoreProperties({"users", "hibernateLazyInitializer", "handler"})
    private Role role;

    /**
     * Lấy danh sách quyền của người dùng
     * @return Danh sách các quyền (GrantedAuthority) của người dùng
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();
        
        // Thêm cả quyền gốc và quyền với tiền tố ROLE_
        authorityList.add(new SimpleGrantedAuthority(getRole().getRoleName())); // Quyền gốc: "Admin"
        authorityList.add(new SimpleGrantedAuthority("ROLE_" + getRole().getRoleName())); // Quyền với tiền tố: "ROLE_Admin"
        
        System.out.println("USER AUTHORITIES: " + authorityList);
        return authorityList;
    }

    /**
     * Lấy tên đăng nhập của người dùng
     * @return Tên đăng nhập
     */
    @Override
    public String getUsername() {
        return this.userName;
    }

    /**
     * Kiểm tra xem tài khoản có hết hạn không
     * @return true nếu tài khoản chưa hết hạn
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Kiểm tra xem tài khoản có bị khóa không
     * @return true nếu tài khoản không bị khóa
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Kiểm tra xem thông tin xác thực (mật khẩu) có hết hạn không
     * @return true nếu thông tin xác thực chưa hết hạn
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Kiểm tra xem tài khoản có được kích hoạt không
     * @return true nếu tài khoản đã được kích hoạt
     */
    @Override
    public boolean isEnabled() {
        return true;
    }
}
