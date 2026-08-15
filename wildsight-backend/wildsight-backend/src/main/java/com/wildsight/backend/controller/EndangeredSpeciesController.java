package com.wildsight.backend.controller;

import com.wildsight.backend.dto.EndangeredSpeciesRequest;
import com.wildsight.backend.dto.EndangeredSpeciesResponse;
import com.wildsight.backend.service.EndangeredSpeciesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/endangered-species")
@RequiredArgsConstructor
@Tag(
    name = "Endangered Species Management",
    description = "APIs for managing endangered species"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class EndangeredSpeciesController {

    private final EndangeredSpeciesService endangeredSpeciesService;
    
    @Operation(summary = "Create endangered species")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public EndangeredSpeciesResponse createEndangeredSpecies(
            @Valid @RequestBody EndangeredSpeciesRequest request) {

        return endangeredSpeciesService.createEndangeredSpecies(request);
    }

    @Operation(summary = "Get all endangered species")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<EndangeredSpeciesResponse> getAllEndangeredSpecies() {

        return endangeredSpeciesService.getAllEndangeredSpecies();
    }

    @Operation(summary = "Get endangered species by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public EndangeredSpeciesResponse getEndangeredSpeciesById(
            @PathVariable Long id) {

        return endangeredSpeciesService.getEndangeredSpeciesById(id);
    }

    @Operation(summary = "Update endangered species")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public EndangeredSpeciesResponse updateEndangeredSpecies(
            @PathVariable Long id,
            @Valid @RequestBody EndangeredSpeciesRequest request) {

        return endangeredSpeciesService.updateEndangeredSpecies(id, request);
    }

    @Operation(summary = "Delete endangered species")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteEndangeredSpecies(
            @PathVariable Long id) {

        endangeredSpeciesService.deleteEndangeredSpecies(id);

        return "Endangered Species deleted successfully";
    }
}