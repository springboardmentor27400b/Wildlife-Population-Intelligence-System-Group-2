package com.wildsight.backend.controller;

import com.wildsight.backend.dto.ConservationPriorityResponse;
import com.wildsight.backend.dto.ConservationRecommendationRequest;
import com.wildsight.backend.dto.ConservationRecommendationResponse;
import com.wildsight.backend.dto.HabitatRestorationResponse;
import com.wildsight.backend.dto.MonitoringOptimizationResponse;
import com.wildsight.backend.dto.ProtectionStrategyResponse;
import com.wildsight.backend.dto.ResourceAllocationResponse;
import com.wildsight.backend.service.ConservationRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import com.wildsight.backend.dto.MonitoringOptimizationResponse;
import com.wildsight.backend.dto.HabitatRestorationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import com.wildsight.backend.dto.ProtectionStrategyResponse;
import com.wildsight.backend.dto.ResourceAllocationResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import com.wildsight.backend.dto.ConservationDashboardResponse;
@RestController
@RequestMapping("/api/conservation-recommendations")
@RequiredArgsConstructor
@Tag(
    name = "Conservation Recommendation Management",
    description = "APIs for managing conservation recommendations"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class ConservationRecommendationController {

    private final ConservationRecommendationService recommendationService;

    @Operation(summary = "Create conservation recommendation")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public ConservationRecommendationResponse createRecommendation(
            @Valid @RequestBody ConservationRecommendationRequest request) {

        return recommendationService.createRecommendation(request);
    }

    @Operation(summary = "Get all conservation recommendations")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<ConservationRecommendationResponse> getAllRecommendations() {

        return recommendationService.getAllRecommendations();
    }

    @Operation(summary = "Get conservation recommendation by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ConservationRecommendationResponse getRecommendationById(
            @PathVariable Long id) {

        return recommendationService.getRecommendationById(id);
    }

    @Operation(summary = "Update conservation recommendation")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public ConservationRecommendationResponse updateRecommendation(
            @PathVariable Long id,
            @Valid @RequestBody ConservationRecommendationRequest request) {

        return recommendationService.updateRecommendation(id, request);
    }

    @Operation(summary = "Delete conservation recommendation")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteRecommendation(
            @PathVariable Long id) {

        recommendationService.deleteRecommendation(id);

        return "Recommendation deleted successfully";
    }
    @Operation(summary = "Get conservation priority recommendation")
@PreAuthorize("isAuthenticated()")
@GetMapping("/priority")
public ResponseEntity<ConservationPriorityResponse> getConservationPriority() {

    return ResponseEntity.ok(
            recommendationService.getConservationPriority()
    );
}
@Operation(summary = "Get habitat restoration suggestions")
@PreAuthorize("isAuthenticated()")
@GetMapping("/restoration")
public ResponseEntity<HabitatRestorationResponse> getHabitatRestoration() {

    return ResponseEntity.ok(
            recommendationService.getHabitatRestoration()
    );

}
@Operation(summary = "Get wildlife protection strategies")
@PreAuthorize("isAuthenticated()")
@GetMapping("/protection")
public ResponseEntity<ProtectionStrategyResponse> getProtectionStrategy() {

    return ResponseEntity.ok(
            recommendationService.getProtectionStrategy()
    );

}
@Operation(summary = "Monitoring optimization recommendations")
@PreAuthorize("isAuthenticated()")
@GetMapping("/monitoring")
public ResponseEntity<MonitoringOptimizationResponse> getMonitoringOptimization() {

    return ResponseEntity.ok(
            recommendationService.getMonitoringOptimization()
    );

}
@Operation(summary = "Resource allocation recommendation")
@PreAuthorize("isAuthenticated()")
@GetMapping("/resource-allocation")
public ResponseEntity<ResourceAllocationResponse> getResourceAllocation() {

    return ResponseEntity.ok(
            recommendationService.getResourceAllocation()
    );

}
@Operation(summary = "Conservation Recommendation Dashboard")
@PreAuthorize("isAuthenticated()")
@GetMapping("/dashboard")
public ResponseEntity<ConservationDashboardResponse> getDashboard() {

    return ResponseEntity.ok(
            recommendationService.getDashboard()
    );

}
}