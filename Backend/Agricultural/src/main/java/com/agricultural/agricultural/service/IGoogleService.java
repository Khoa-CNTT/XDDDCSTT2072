package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.response.LoginResponse;

public interface IGoogleService {

    LoginResponse loginWithGoogle(String idToken) throws Exception;
} 