package com.agricultural.agricultural.service;

public interface IPasswordResetService {
    void sendPasswordResetEmail(String email);
    boolean resetPassword(String token, String newPassword);
}
