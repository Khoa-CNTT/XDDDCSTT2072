package com.agricultural.agricultural.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginDTO {
    private String idToken; // Token ID từ Google sau khi xác thực thành công
} 