package com.wildsight.backend.controller;

import com.wildsight.backend.dto.EnvironmentalMonitoringResponse;
import com.wildsight.backend.dto.HabitatClassificationResponse;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import com.wildsight.backend.dto.HabitatDegradationResponse;
import com.wildsight.backend.dto.HabitatRequest;
import com.wildsight.backend.dto.HabitatResponse;
import com.wildsight.backend.dto.HabitatSuitabilityResponse;
import com.wildsight.backend.dto.VegetationAnalysisResponse;
import com.wildsight.backend.service.HabitatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.wildsight.backend.dto.HabitatDegradationResponse;
import org.springframework.http.ResponseEntity;
@RestController
@RequestMapping("/api/habitats")
@RequiredArgsConstructor
@Tag(
    name = "Habitat Management",
    description = "APIs for managing habitats"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class HabitatController {

    private final HabitatService habitatService;
    
    @Operation(summary = "Create habitat")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public HabitatResponse createHabitat(
            @Valid @RequestBody HabitatRequest request) {

        return habitatService.createHabitat(request);
    }

    @Operation(summary = "Get all habitats")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<HabitatResponse> getAllHabitats() {

        return habitatService.getAllHabitats();
    }

    @Operation(summary = "Get habitat by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public HabitatResponse getHabitatById(
            @PathVariable Long id) {

        return habitatService.getHabitatById(id);
    }

    @Operation(summary = "Update habitat")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public HabitatResponse updateHabitat(
            @PathVariable Long id,
            @Valid @RequestBody HabitatRequest request) {

        return habitatService.updateHabitat(id, request);
    }

    @Operation(summary = "Delete habitat")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteHabitat(
            @PathVariable Long id) {

        habitatService.deleteHabitat(id);

        return "Habitat deleted successfully";
    }
    @Operation(summary = "Get habitat dashboard analytics")
@PreAuthorize("isAuthenticated()")
@GetMapping("/dashboard")
public ResponseEntity<HabitatDashboardResponse> getDashboard() {

    return ResponseEntity.ok(
            habitatService.getDashboard()
    );


}
@Operation(summary = "Analyze habitat classification")
@PreAuthorize("isAuthenticated()")
@GetMapping("/classification")
public ResponseEntity<HabitatClassificationResponse> getHabitatClassification() {

    return ResponseEntity.ok(
            habitatService.getHabitatClassification()
    );

}
@Operation(summary = "Analyze habitat degradation")
@PreAuthorize("isAuthenticated()")
@GetMapping("/degradation")
public ResponseEntity<HabitatDegradationResponse> getHabitatDegradation() {

    return ResponseEntity.ok(
            habitatService.getHabitatDegradation()
    );

}
@Operation(summary = "Vegetation analysis")
@PreAuthorize("isAuthenticated()")
@GetMapping("/vegetation-analysis")
public ResponseEntity<VegetationAnalysisResponse> getVegetationAnalysis() {

    return ResponseEntity.ok(
            habitatService.getVegetationAnalysis()
    );

}
@Operation(summary = "Environmental condition monitoring")
@PreAuthorize("isAuthenticated()")
@GetMapping("/environment-monitoring")
public ResponseEntity<EnvironmentalMonitoringResponse> getEnvironmentalMonitoring() {

    return ResponseEntity.ok(
            habitatService.getEnvironmentalMonitoring()
    );

}
@Operation(summary = "Habitat suitability prediction")
@PreAuthorize("isAuthenticated()")
@GetMapping("/suitability")
public ResponseEntity<HabitatSuitabilityResponse> getHabitatSuitability() {

    return ResponseEntity.ok(
            habitatService.getHabitatSuitability()
    );

}
}