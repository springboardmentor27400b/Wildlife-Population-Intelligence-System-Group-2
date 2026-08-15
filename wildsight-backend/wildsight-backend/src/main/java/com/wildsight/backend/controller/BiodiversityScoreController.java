package com.wildsight.backend.controller;

import com.wildsight.backend.dto.BiodiversityDashboardResponse;
import com.wildsight.backend.dto.BiodiversityScoreRequest;
import com.wildsight.backend.dto.BiodiversityScoreResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
import com.wildsight.backend.dto.EcosystemMonitoringResponse;
import com.wildsight.backend.dto.HabitatHealthResponse;
import com.wildsight.backend.dto.SpeciesDiversityChartResponse;
import com.wildsight.backend.dto.SpeciesDiversityResponse;
import com.wildsight.backend.service.BiodiversityScoreService;
import com.wildsight.backend.dto.BiodiversityIndexResponse;
import jakarta.validation.Valid;
import com.wildsight.backend.dto.EcosystemMonitoringResponse;
import lombok.RequiredArgsConstructor;
import com.wildsight.backend.dto.HabitatHealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wildsight.backend.dto.SpeciesDiversityResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;


@RestController
@RequestMapping("/api/biodiversity-scores")
@RequiredArgsConstructor
@Tag(
        name = "Biodiversity Score Management",
        description = "APIs for managing biodiversity scores"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class BiodiversityScoreController {


    private final BiodiversityScoreService biodiversityScoreService;



    @Operation(summary = "Create biodiversity score")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public BiodiversityScoreResponse createScore(
            @Valid @RequestBody BiodiversityScoreRequest request) {

        return biodiversityScoreService.createScore(request);
    }



    @Operation(summary = "Get biodiversity dashboard analytics")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/dashboard")
    public ResponseEntity<BiodiversityDashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                biodiversityScoreService.getDashboard()
        );
    }



    @Operation(summary = "Get all biodiversity scores")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<BiodiversityScoreResponse> getAllScores() {

        return biodiversityScoreService.getAllScores();
    }



    @Operation(summary = "Get biodiversity score by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public BiodiversityScoreResponse getScoreById(
            @PathVariable Long id) {

        return biodiversityScoreService.getScoreById(id);
    }



    @Operation(summary = "Update biodiversity score")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public BiodiversityScoreResponse updateScore(
            @PathVariable Long id,
            @Valid @RequestBody BiodiversityScoreRequest request) {

        return biodiversityScoreService.updateScore(id, request);
    }



    @Operation(summary = "Delete biodiversity score")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteScore(
            @PathVariable Long id) {

        biodiversityScoreService.deleteScore(id);

        return "Biodiversity Score deleted successfully";
    }

    @Operation(summary = "Calculate biodiversity index")
@PreAuthorize("isAuthenticated()")
@GetMapping("/index")
public ResponseEntity<BiodiversityIndexResponse> getBiodiversityIndex(){

    return ResponseEntity.ok(
            biodiversityScoreService.getBiodiversityIndex()
    );

}

@Operation(summary = "Analyze species diversity")
@PreAuthorize("isAuthenticated()")
@GetMapping("/species-analysis")
public ResponseEntity<SpeciesDiversityResponse> getSpeciesAnalysis(){

    return ResponseEntity.ok(
            biodiversityScoreService.getSpeciesDiversityAnalysis()
    );

}

@Operation(summary = "Analyze habitat health")
@PreAuthorize("isAuthenticated()")
@GetMapping("/habitat-health")
public ResponseEntity<HabitatHealthResponse> getHabitatHealth(){

    return ResponseEntity.ok(
            biodiversityScoreService.getHabitatHealthAssessment()
    );

}

@Operation(summary = "Analyze ecosystem monitoring status")
@PreAuthorize("isAuthenticated()")
@GetMapping("/ecosystem-monitoring")
public ResponseEntity<EcosystemMonitoringResponse> getEcosystemMonitoring(){

    return ResponseEntity.ok(
            biodiversityScoreService.getEcosystemMonitoring()
    );

}
@Operation(summary = "Species diversity chart")
@PreAuthorize("isAuthenticated()")
@GetMapping("/species-chart")
public ResponseEntity<List<SpeciesDiversityChartResponse>>
getSpeciesChart(){

    return ResponseEntity.ok(

            biodiversityScoreService
                    .getSpeciesDiversityChart()

    );

}


}