package com.wildsight.backend.controller;

import com.wildsight.backend.dto.AuthResponse;
import com.wildsight.backend.dto.LoginRequest;
import com.wildsight.backend.dto.RegisterRequest;
import com.wildsight.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(
    name = "Authentication",
    description = "User registration and login APIs"
)
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user")
@PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    @Operation(summary = "Authenticate user and generate JWT token")
@PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }
}