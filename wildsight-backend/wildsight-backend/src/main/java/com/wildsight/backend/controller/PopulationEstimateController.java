package com.wildsight.backend.controller;

import com.wildsight.backend.dto.PopulationEstimateRequest;
import com.wildsight.backend.dto.PopulationEstimateResponse;
import com.wildsight.backend.service.PopulationEstimateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/population-estimates")
@RequiredArgsConstructor
@Tag(
    name = "Population Estimate Management",
    description = "APIs for managing population estimates"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class PopulationEstimateController {

    private final PopulationEstimateService populationEstimateService;

    @Operation(summary = "Create population estimate")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public PopulationEstimateResponse createEstimate(
            @Valid @RequestBody PopulationEstimateRequest request) {

        return populationEstimateService.createEstimate(request);
    }

    @Operation(summary = "Get all population estimates")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<PopulationEstimateResponse> getAllEstimates() {

        return populationEstimateService.getAllEstimates();
    }

    @Operation(summary = "Get population estimate by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public PopulationEstimateResponse getEstimateById(
            @PathVariable Long id) {

        return populationEstimateService.getEstimateById(id);
    }

    @Operation(summary = "Update population estimate")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public PopulationEstimateResponse updateEstimate(
            @PathVariable Long id,
            @Valid @RequestBody PopulationEstimateRequest request) {

        return populationEstimateService.updateEstimate(id, request);
    }

    @Operation(summary = "Delete population estimate")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteEstimate(
            @PathVariable Long id) {

        populationEstimateService.deleteEstimate(id);

        return "Population Estimate deleted successfully";
    }
}