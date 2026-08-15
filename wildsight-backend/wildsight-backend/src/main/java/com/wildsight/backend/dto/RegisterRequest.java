package com.wildsight.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 50,
            message = "Full name must be between 3 and 50 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 30,
            message = "Password must be between 8 and 30 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,30}$",
            message = "Password must contain uppercase, lowercase, number and special character"
    )
    private String password;

    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Phone number must contain 10 digits"
    )
    private String phone;

    @Size(max = 100,
            message = "Organization name cannot exceed 100 characters")
    private String organization;

    @Size(max = 100,
            message = "Designation cannot exceed 100 characters")
    private String designation;

    @NotBlank(message = "Role is required")
    private String role;
}