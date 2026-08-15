package com.wildsight.backend.controller;

import com.wildsight.backend.dto.AudioDetectionRequest;
import com.wildsight.backend.dto.AudioDetectionResponse;
import com.wildsight.backend.service.AudioDetectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/audio-detections")
@RequiredArgsConstructor
@Tag(
    name = "Audio Detection Management",
    description = "APIs for managing audio detections"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class AudioDetectionController {

    private final AudioDetectionService audioDetectionService;
    
    @Operation(summary = "Create audio detection")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public AudioDetectionResponse createDetection(
            @Valid @RequestBody AudioDetectionRequest request) {

        return audioDetectionService.createDetection(request);
    }

    @Operation(summary = "Get all audio detections")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<AudioDetectionResponse> getAllDetections() {

        return audioDetectionService.getAllDetections();
    }

    @Operation(summary = "Get audio detection by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public AudioDetectionResponse getDetectionById(
            @PathVariable Long id) {

        return audioDetectionService.getDetectionById(id);
    }

    @Operation(summary = "Update audio detection")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public AudioDetectionResponse updateDetection(
            @PathVariable Long id,
            @Valid @RequestBody AudioDetectionRequest request) {

        return audioDetectionService.updateDetection(id, request);
    }

    @Operation(summary = "Delete audio detection")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteDetection(
            @PathVariable Long id) {

        audioDetectionService.deleteDetection(id);

        return "Audio Detection deleted successfully";
    }
}