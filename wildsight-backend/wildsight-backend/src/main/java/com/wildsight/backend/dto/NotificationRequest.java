package com.wildsight.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    @NotNull(message = "User is required")
    private Long userId;

    @NotBlank(message = "Notification title is required")
    @Size(min = 3, max = 200,
            message = "Notification title must be between 3 and 200 characters")
    private String title;

    @NotBlank(message = "Notification message is required")
    @Size(max = 1000,
            message = "Notification message cannot exceed 1000 characters")
    private String message;

    @NotBlank(message = "Notification type is required")
    @Size(max = 100,
            message = "Notification type cannot exceed 100 characters")
    private String notificationType;

    @NotNull(message = "Read status is required")
    private Boolean isRead;

    private LocalDateTime readAt;
}