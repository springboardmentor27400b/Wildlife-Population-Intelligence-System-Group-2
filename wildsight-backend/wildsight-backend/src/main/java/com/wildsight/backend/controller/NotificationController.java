package com.wildsight.backend.controller;
import com.wildsight.backend.service.AlertService;
import com.wildsight.backend.dto.NotificationRequest;
import com.wildsight.backend.dto.NotificationResponse;
import com.wildsight.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(
    name = "Notification Management",
    description = "APIs for managing notifications"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final AlertService alertService;
    @Operation(summary = "Create notification")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public NotificationResponse createNotification(
            @Valid @RequestBody NotificationRequest request) {

        return notificationService.createNotification(request);
    }

    @Operation(summary = "Get all notifications")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<NotificationResponse> getAllNotifications() {

        return notificationService.getAllNotifications();
    }

    @Operation(summary = "Get notification by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public NotificationResponse getNotificationById(
            @PathVariable Long id) {

        return notificationService.getNotificationById(id);
    }

    @Operation(summary = "Update notification")
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}")
    public NotificationResponse updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody NotificationRequest request) {

        return notificationService.updateNotification(id, request);
    }

    @Operation(summary = "Delete notification")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);

        return "Notification deleted successfully";
    }
    @Operation(summary = "Generate wildlife alerts")
@PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
@PostMapping("/generate-alerts")
public String generateAlerts() {

    alertService.generateAlerts();

    return "Wildlife alerts generated successfully";
}
}