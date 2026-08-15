package com.wildsight.backend.service;

import com.wildsight.backend.dto.AuthResponse;
import com.wildsight.backend.dto.LoginRequest;
import com.wildsight.backend.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}