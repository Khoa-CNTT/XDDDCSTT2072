package com.agricultural.agricultural.util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    USER_NOT_FOUND(404, "User Not Found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(404, "Role Not Found", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTS(409, "User Not Exists", HttpStatus.CONFLICT),
    ID_NOT_EXISTS(409, "Id Not Exists", HttpStatus.CONFLICT),
    ILLEGAL_STATE(400, "Wrong password or username", HttpStatus.BAD_REQUEST),
    MAIL_PHONE_USERNAME_ALREADY_EXISTED(409, "Email, Phone or Username Already Exists", HttpStatus.CONFLICT),
    INVALID_PASSWORD(409, "Invalid Password", HttpStatus.CONFLICT),
    INVALID_INPUT(411, "Dữ liệu đầu vào không hợp lệ", HttpStatus.CONFLICT),
    ;
    int code;
    String message;
    HttpStatus httpStatus;
}
