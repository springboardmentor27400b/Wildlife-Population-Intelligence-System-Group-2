package com.wildsight.backend.service;

import com.wildsight.backend.dto.NotificationRequest;
import com.wildsight.backend.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(NotificationRequest request);

    List<NotificationResponse> getAllNotifications();

    NotificationResponse getNotificationById(Long id);

    NotificationResponse updateNotification(
            Long id,
            NotificationRequest request);

    void deleteNotification(Long id);
}