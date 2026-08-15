package com.wildsight.backend.controller;

import com.wildsight.backend.dto.MonitoringDeviceRequest;
import com.wildsight.backend.dto.MonitoringDeviceResponse;
import com.wildsight.backend.service.MonitoringDeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/monitoring-devices")
@RequiredArgsConstructor
@Tag(
    name = "Monitoring Device Management",
    description = "APIs for managing monitoring devices"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class MonitoringDeviceController {

    private final MonitoringDeviceService monitoringDeviceService;
    
    @Operation(summary = "Create monitoring device")
    @PreAuthorize("hasAnyRole('ADMIN','FOREST_OFFICER')")
    @PostMapping
    public MonitoringDeviceResponse createDevice(
            @Valid @RequestBody MonitoringDeviceRequest request) {

        return monitoringDeviceService.createDevice(request);
    }

    @Operation(summary = "Get all monitoring devices")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<MonitoringDeviceResponse> getAllDevices() {

        return monitoringDeviceService.getAllDevices();
    }

    @Operation(summary = "Get monitoring device by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public MonitoringDeviceResponse getDeviceById(
            @PathVariable Long id) {

        return monitoringDeviceService.getDeviceById(id);
    }

    @Operation(summary = "Update monitoring device")
    @PreAuthorize("hasAnyRole('ADMIN','FOREST_OFFICER')")
    @PutMapping("/{id}")
    public MonitoringDeviceResponse updateDevice(
            @PathVariable Long id,
            @Valid @RequestBody MonitoringDeviceRequest request) {

        return monitoringDeviceService.updateDevice(id, request);
    }

    @Operation(summary = "Delete monitoring device")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteDevice(
            @PathVariable Long id) {

        monitoringDeviceService.deleteDevice(id);

        return "Monitoring Device deleted successfully";
    }
}