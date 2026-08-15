package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.AuthResponse;
import com.wildsight.backend.dto.LoginRequest;
import com.wildsight.backend.dto.RegisterRequest;
import com.wildsight.backend.entity.Role;
import com.wildsight.backend.entity.User;
import com.wildsight.backend.entity.UserRole;
import com.wildsight.backend.repository.RoleRepository;
import com.wildsight.backend.repository.UserRepository;
import com.wildsight.backend.repository.UserRoleRepository;
import com.wildsight.backend.security.JwtService;
import com.wildsight.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "An account already exists with this email."
            );
        }

        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new RuntimeException(
                    "Admin registration is not allowed. Please contact the system administrator."
            );
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .organization(request.getOrganization())
                .designation(request.getDesignation())
                .status("ACTIVE")
                .build();

        user = userRepository.save(user);

        Role role = roleRepository.findByRoleName(request.getRole().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .build();

        userRoleRepository.save(userRole);

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .message("Registration Successful")
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(role.getRoleName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

        String role = user.getUserRoles()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User role not found"))
                .getRole()
                .getRoleName();

        return AuthResponse.builder()
                .token(token)
                .message("Login Successful")
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(role)
                .build();
    }
}