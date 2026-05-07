package com.enscs.internship.service;

import com.enscs.internship.dto.request.LoginRequest;
import com.enscs.internship.dto.request.RegisterRequest;
import com.enscs.internship.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
