package com.wildsight.backend.controller;

import com.wildsight.backend.dto.PopulationHistoryRequest;
import com.wildsight.backend.dto.PopulationHistoryResponse;
import com.wildsight.backend.service.PopulationHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/population-history")
@RequiredArgsConstructor
@Tag(
    name = "Population History Management",
    description = "APIs for managing population history"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class PopulationHistoryController {

    private final PopulationHistoryService populationHistoryService;

    @Operation(summary = "Create population history")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public PopulationHistoryResponse createHistory(
            @Valid @RequestBody PopulationHistoryRequest request) {

        return populationHistoryService.createHistory(request);
    }

    @Operation(summary = "Get all population history")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<PopulationHistoryResponse> getAllHistory() {

        return populationHistoryService.getAllHistory();
    }

    @Operation(summary = "Get population history by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public PopulationHistoryResponse getHistoryById(
            @PathVariable Long id) {

        return populationHistoryService.getHistoryById(id);
    }

    @Operation(summary = "Update population history")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public PopulationHistoryResponse updateHistory(
            @PathVariable Long id,
            @Valid @RequestBody PopulationHistoryRequest request) {

        return populationHistoryService.updateHistory(id, request);
    }

    @Operation(summary = "Delete population history")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteHistory(
            @PathVariable Long id) {

        populationHistoryService.deleteHistory(id);

        return "Population History deleted successfully";
    }
}