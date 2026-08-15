package com.wildsight.backend.controller;

import com.wildsight.backend.dto.UploadedAudioRequest;
import com.wildsight.backend.dto.UploadedAudioResponse;
import com.wildsight.backend.service.UploadedAudioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/uploaded-audio")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(
    name = "Uploaded Audio Management",
    description = "APIs for managing uploaded audio"
)
@SecurityRequirement(name = "Bearer Authentication")
public class UploadedAudioController {

    private final UploadedAudioService uploadedAudioService;
    
    @Operation(summary = "Create uploaded audio")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER','VOLUNTEER')")
    @PostMapping
    public UploadedAudioResponse createAudio(
            @Valid @RequestBody UploadedAudioRequest request) {

        return uploadedAudioService.uploadAudio(request);
    }

    @Operation(summary = "Get all uploaded audio")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<UploadedAudioResponse> getAllAudio() {

        return uploadedAudioService.getAllAudio();
    }

    @Operation(summary = "Get uploaded audio by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public UploadedAudioResponse getAudioById(
            @PathVariable Long id) {

        return uploadedAudioService.getAudioById(id);
    }

    @Operation(summary = "Update uploaded audio")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public UploadedAudioResponse updateAudio(
            @PathVariable Long id,
            @Valid @RequestBody UploadedAudioRequest request) {

        return uploadedAudioService.updateAudio(id, request);
    }

    @Operation(summary = "Delete uploaded audio")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteAudio(
            @PathVariable Long id) {

        uploadedAudioService.deleteAudio(id);

        return "Uploaded Audio deleted successfully";
    }
    
    @Operation(summary = "Upload audio file")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER','VOLUNTEER')")
    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public UploadedAudioResponse uploadAudio(

            @RequestParam("file") MultipartFile file,

            @RequestParam Long observationId,

            @RequestParam Long uploadedBy,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime capturedAt,

            @RequestParam BigDecimal durationSeconds

    ) throws IOException {

        return uploadedAudioService.uploadAudio(
                file,
                observationId,
                uploadedBy,
                capturedAt,
                durationSeconds
        );
    }
}