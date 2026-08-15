package com.wildsight.backend.controller;

import com.wildsight.backend.dto.EnvironmentConditionRequest;
import com.wildsight.backend.dto.EnvironmentConditionResponse;
import com.wildsight.backend.service.EnvironmentConditionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/environment-conditions")
@RequiredArgsConstructor
@Tag(
    name = "Environment Condition Management",
    description = "APIs for managing environment conditions"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class EnvironmentConditionController {

    private final EnvironmentConditionService environmentConditionService;

    @Operation(summary = "Create environment condition")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @PostMapping
    public EnvironmentConditionResponse createCondition(
            @Valid @RequestBody EnvironmentConditionRequest request) {

        return environmentConditionService.createCondition(request);
    }

    @Operation(summary = "Get all environment conditions")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<EnvironmentConditionResponse> getAllConditions() {

        return environmentConditionService.getAllConditions();
    }

    @Operation(summary = "Get environment condition by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public EnvironmentConditionResponse getConditionById(
            @PathVariable Long id) {

        return environmentConditionService.getConditionById(id);
    }

    @Operation(summary = "Update environment condition")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @PutMapping("/{id}")
    public EnvironmentConditionResponse updateCondition(
            @PathVariable Long id,
            @Valid @RequestBody EnvironmentConditionRequest request) {

        return environmentConditionService.updateCondition(id, request);
    }

    @Operation(summary = "Delete environment condition")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteCondition(
            @PathVariable Long id) {

        environmentConditionService.deleteCondition(id);

        return "Environment Condition deleted successfully";
    }
}