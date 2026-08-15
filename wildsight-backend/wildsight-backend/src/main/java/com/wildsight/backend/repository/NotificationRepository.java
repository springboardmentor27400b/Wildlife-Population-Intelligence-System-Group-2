package com.wildsight.backend.repository;

import com.wildsight.backend.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    boolean existsByUserUserIdAndTitleAndMessage(
            Long userId,
            String title,
            String message
    );
}