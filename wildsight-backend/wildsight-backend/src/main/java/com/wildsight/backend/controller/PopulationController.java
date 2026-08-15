package com.wildsight.backend.controller;

import com.wildsight.backend.dto.population.MigrationResponse;
import com.wildsight.backend.dto.population.PopulationDashboardResponse;
import com.wildsight.backend.dto.population.PopulationDistributionResponse;
import com.wildsight.backend.dto.population.PopulationTrendResponse;
import com.wildsight.backend.service.PopulationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/population")
@RequiredArgsConstructor
@Tag(
        name = "Population Intelligence",
        description = "APIs for Wildlife Population Estimation, Distribution, Migration and Population Intelligence"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class PopulationController {

    private final PopulationService populationService;

    @Operation(summary = "Get Population Dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @GetMapping("/dashboard")
    public PopulationDashboardResponse getDashboard() {

        return populationService.getDashboard();

    }

    @Operation(summary = "Get Population Trends")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @GetMapping("/trends")
    public List<PopulationTrendResponse> getPopulationTrends() {

        return populationService.getPopulationTrend();

    }

    @Operation(summary = "Get Population Distribution")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @GetMapping("/distribution")
    public List<PopulationDistributionResponse> getPopulationDistribution() {

        return populationService.getPopulationDistribution();

    }

    @Operation(summary = "Get Wildlife Migration Analysis")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @GetMapping("/migration")
    public List<MigrationResponse> getMigrationAnalysis() {

        return populationService.getMigrationAnalysis();

    }

}