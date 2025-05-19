package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.response.LoginResponse;

public interface IGoogleService {
    /**
     * Xác thực và đăng nhập bằng Google ID Token
     *
     * @param idToken Token ID từ Google
     * @return LoginResponse chứa thông tin đăng nhập và JWT token
     * @throws Exception nếu có lỗi xảy ra trong quá trình xử lý
     */
    LoginResponse loginWithGoogle(String idToken) throws Exception;
} 