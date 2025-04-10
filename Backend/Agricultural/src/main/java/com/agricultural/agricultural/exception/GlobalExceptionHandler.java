package com.agricultural.agricultural.exception;

import com.agricultural.agricultural.util.ResponseObject;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ResponseObject> handleEntityNotFoundException(EntityNotFoundException ex) {
        ResponseObject responseObject = ResponseObject.builder()
                .status("NOT_FOUND")
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(responseObject, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PermissionDenyException.class)
    public ResponseEntity<ResponseObject> handlePermissionDenyException(PermissionDenyException ex) {
        ResponseObject responseObject = ResponseObject.builder()
                .status("FORBIDDEN")
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(responseObject, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseObject> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        ResponseObject responseObject = ResponseObject.builder()
                .status("BAD_REQUEST")
                .message("Dữ liệu không hợp lệ")
                .data(errors)
                .build();
        return new ResponseEntity<>(responseObject, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseObject> handleGeneralException(Exception ex) {
        ResponseObject responseObject = ResponseObject.builder()
                .status("ERROR")
                .message("Đã xảy ra lỗi: " + ex.getMessage())
                .build();
        return new ResponseEntity<>(responseObject, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolationException(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
