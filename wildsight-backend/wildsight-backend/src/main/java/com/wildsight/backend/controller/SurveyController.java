package com.wildsight.backend.controller;

import com.wildsight.backend.dto.SurveyRequest;
import com.wildsight.backend.dto.SurveyResponse;
import com.wildsight.backend.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import com.wildsight.backend.dto.SurveyDashboardResponse;
import org.springframework.http.ResponseEntity;
@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(
    name = "Survey Management",
    description = "APIs for managing wildlife surveys"
)
@SecurityRequirement(name = "Bearer Authentication")
public class SurveyController {

    private final SurveyService surveyService;

    @Operation(summary = "Create a new survey")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
@PostMapping
public SurveyResponse createSurvey(
        @Valid @RequestBody SurveyRequest request) {

    return surveyService.createSurvey(request);
}

    @Operation(summary = "Get all surveys")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<SurveyResponse> getAllSurveys() {
        return surveyService.getAllSurveys();
    }

   @Operation(summary = "Get survey by ID")
   @PreAuthorize("isAuthenticated()")
@GetMapping("/{id}")
    public SurveyResponse getSurveyById(@PathVariable Long id) {
        return surveyService.getSurveyById(id);
    }

    @Operation(summary = "Update survey")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public SurveyResponse updateSurvey(
            @PathVariable Long id,
            @Valid @RequestBody SurveyRequest request) {

    return surveyService.updateSurvey(id, request);
}
    @Operation(summary = "Delete survey")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteSurvey(@PathVariable Long id) {
        surveyService.deleteSurvey(id);
        return "Survey deleted successfully";
    }
    @Operation(summary = "Get survey dashboard analytics")
@PreAuthorize("isAuthenticated()")
@GetMapping("/dashboard")
public ResponseEntity<SurveyDashboardResponse> getDashboard(){

    return ResponseEntity.ok(
            surveyService.getDashboard()
    );

}
}
