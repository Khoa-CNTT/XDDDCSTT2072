package com.agricultural.agricultural.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAddressDTO {
    private int id; // Không cần validation vì ID thường do hệ thống tự sinh

    @NotNull(message = "User ID không được để trống")
    private int userId; // ✅ Đúng: Tên thuộc tính phải khớp với @Mapping trong Mapper


    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 255, message = "Địa chỉ không được dài quá 255 ký tự")
    private String address;

    @NotBlank(message = "Thành phố không được để trống")
    @Size(max = 100, message = "Tên thành phố không được dài quá 100 ký tự")
    private String city;

    @NotBlank(message = "Quốc gia không được để trống")
    @Size(max = 100, message = "Tên quốc gia không được dài quá 100 ký tự")
    private String country;

    @NotBlank(message = "Mã bưu chính không được để trống")
    @Pattern(regexp = "\\d{5,6}", message = "Mã bưu chính phải có từ 5 đến 6 chữ số")
    private String postalCode;
}
