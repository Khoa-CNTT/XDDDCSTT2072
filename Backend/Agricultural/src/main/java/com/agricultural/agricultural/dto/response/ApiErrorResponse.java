package com.agricultural.agricultural.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Class API Error Response cũ - Được giữ lại chỉ để tương thích ngược với code cũ
 * Không nên sử dụng cho các controller mới, hãy sử dụng ResponseObject thay thế
 */
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {
    private int status;
    private String message;
    private String path;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    private Map<String, String> errors;
    
    public ApiErrorResponse(int status, String message, String path) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }
    
    public ApiErrorResponse(int status, String message, String path, Map<String, String> errors) {
        this(status, message, path);
        this.errors = errors;
    }
} 