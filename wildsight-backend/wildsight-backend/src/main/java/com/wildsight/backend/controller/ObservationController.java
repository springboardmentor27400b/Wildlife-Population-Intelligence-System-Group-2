package com.wildsight.backend.controller;

import com.wildsight.backend.dto.ObservationRequest;
import com.wildsight.backend.dto.ObservationResponse;
import com.wildsight.backend.service.ObservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/observations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(
    name = "Observation Management",
    description = "APIs for managing observations"
)
@SecurityRequirement(name = "Bearer Authentication")
public class ObservationController {

    private final ObservationService observationService;

    @Operation(summary = "Create observation")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER','VOLUNTEER')")
    @PostMapping
    public ObservationResponse createObservation(
            @Valid @RequestBody ObservationRequest request) {

        return observationService.createObservation(request);
    }

    @Operation(summary = "Get all observations")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<ObservationResponse> getAllObservations() {

        return observationService.getAllObservations();
    }

    @Operation(summary = "Get observation by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ObservationResponse getObservationById(
            @PathVariable Long id) {

        return observationService.getObservationById(id);
    }

    @Operation(summary = "Update observation")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @PutMapping("/{id}")
    public ObservationResponse updateObservation(
            @PathVariable Long id,
            @Valid @RequestBody ObservationRequest request) {

        return observationService.updateObservation(id, request);
    }

    @Operation(summary = "Delete observation")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteObservation(
            @PathVariable Long id) {

        observationService.deleteObservation(id);

        return "Observation deleted successfully";
    }
}
