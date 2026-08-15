package com.wildsight.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long notificationId;

    private Long userId;

    private String userName;

    private String title;

    private String message;

    private String notificationType;

    private Boolean isRead;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;
}