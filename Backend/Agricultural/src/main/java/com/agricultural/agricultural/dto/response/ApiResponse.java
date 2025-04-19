package com.agricultural.agricultural.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponse<T> {
    Integer code;
    String message;
    T data;

    public ApiResponse(boolean success, String message, T data) {
        this.code = success ? 200 : 400;
        this.message = message;
        this.data = data;
    }
}
