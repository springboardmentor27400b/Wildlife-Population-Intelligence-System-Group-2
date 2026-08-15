package com.wildsight.backend.controller;

import com.wildsight.backend.dto.ReportRequest;
import com.wildsight.backend.dto.ReportResponse;
import com.wildsight.backend.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(
    name = "Report Management",
    description = "APIs for managing reports"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Create report")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PostMapping
    public ReportResponse createReport(
            @Valid @RequestBody ReportRequest request) {

        return reportService.createReport(request);
    }

    @Operation(summary = "Get all reports")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @GetMapping
    public List<ReportResponse> getAllReports() {

        return reportService.getAllReports();
    }

    @Operation(summary = "Get report by ID")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')")
    @GetMapping("/{id}")
    public ReportResponse getReportById(
            @PathVariable Long id) {

        return reportService.getReportById(id);
    }

    @Operation(summary = "Update report")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{id}")
    public ReportResponse updateReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportRequest request) {

        return reportService.updateReport(id, request);
    }

    @Operation(summary = "Delete report")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteReport(
            @PathVariable Long id) {

        reportService.deleteReport(id);

        return "Report deleted successfully";
    }
    @Operation(
summary="Generate intelligence report"
)
@PreAuthorize(
"hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')"
)
@PostMapping("/generate")
public ReportResponse generateReport(
@RequestParam String type,
@RequestParam Long surveyId,
@RequestParam Long userId
){


return reportService.generateSystemReport(
        type,
        surveyId,
        userId
);


}
}