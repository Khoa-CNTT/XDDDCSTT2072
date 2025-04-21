package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO<T> {
    private boolean success;
    private String message;
    private T data;
    private String errorCode;
    private String errorMessage;

    public static <T> ResponseDTO<T> success(T data) {
        return ResponseDTO.<T>builder()
                .success(true)
                .message("Thành công")
                .data(data)
                .build();
    }

    public static <T> ResponseDTO<T> success(T data, String message) {
        return ResponseDTO.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ResponseDTO<T> error(String errorCode, String errorMessage) {
        return ResponseDTO.<T>builder()
                .success(false)
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .build();
    }

    public static <T> ResponseDTO<T> error(String errorMessage) {
        return ResponseDTO.<T>builder()
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
} 