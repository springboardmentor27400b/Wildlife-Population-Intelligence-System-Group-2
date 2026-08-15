package com.wildsight.backend.controller;
import org.springframework.security.access.prepost.PreAuthorize;
import com.wildsight.backend.dto.SpeciesRequest;
import com.wildsight.backend.dto.SpeciesResponse;
import com.wildsight.backend.service.SpeciesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/species")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(
    name = "Species Management",
    description = "APIs for managing species"
)
@SecurityRequirement(name = "Bearer Authentication")
public class SpeciesController {

    private final SpeciesService speciesService;
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @Operation(summary = "Create species")
    @PostMapping
    public SpeciesResponse createSpecies(
            @Valid @RequestBody SpeciesRequest request) {

        return speciesService.createSpecies(request);
    }
    
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all species")
    @GetMapping
    public List<SpeciesResponse> getAllSpecies() {

        return speciesService.getAllSpecies();
    }
    
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get species by ID")
    @GetMapping("/{id}")
    public SpeciesResponse getSpeciesById(
            @PathVariable Long id) {

        return speciesService.getSpeciesById(id);
    }
    
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @Operation(summary = "Update species")
    @PutMapping("/{id}")
    public SpeciesResponse updateSpecies(
            @PathVariable Long id,
            @Valid @RequestBody SpeciesRequest request) {

        return speciesService.updateSpecies(id, request);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete species")
    @DeleteMapping("/{id}")
    public String deleteSpecies(
            @PathVariable Long id) {

        speciesService.deleteSpecies(id);

        return "Species deleted successfully";
    }
}