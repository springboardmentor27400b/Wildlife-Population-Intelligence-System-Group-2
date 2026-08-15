package com.wildsight.backend.controller;

import com.wildsight.backend.dto.ReportExportRequest;
import com.wildsight.backend.dto.ReportExportResponse;
import com.wildsight.backend.service.ReportExportService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;


@RestController
@RequestMapping("/api/report-exports")
@RequiredArgsConstructor
@Tag(
        name = "Report Export Management",
        description = "APIs for managing report exports"
)
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "*")
public class ReportExportController {


    private final ReportExportService reportExportService;


    // ============================================================
    // CREATE
    // ============================================================

    @Operation(
            summary = "Create report export"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')"
    )
    @PostMapping
    public ReportExportResponse createExport(
            @Valid
            @RequestBody
            ReportExportRequest request) {

        return reportExportService
                .createExport(request);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @Operation(
            summary = "Get all report exports"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')"
    )
    @GetMapping
    public List<ReportExportResponse> getAllExports() {

        return reportExportService
                .getAllExports();
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    @Operation(
            summary = "Get report export by ID"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')"
    )
    @GetMapping("/{id}")
    public ReportExportResponse getExportById(
            @PathVariable Long id) {

        return reportExportService
                .getExportById(id);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @Operation(
            summary = "Update report export"
    )
    @PreAuthorize(
            "hasRole('ADMIN')"
    )
    @PutMapping("/{id}")
    public ReportExportResponse updateExport(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ReportExportRequest request) {

        return reportExportService
                .updateExport(
                        id,
                        request
                );
    }


    // ============================================================
    // DELETE
    // ============================================================

    @Operation(
            summary = "Delete report export"
    )
    @PreAuthorize(
            "hasRole('ADMIN')"
    )
    @DeleteMapping("/{id}")
    public String deleteExport(
            @PathVariable Long id) {

        reportExportService
                .deleteExport(id);

        return "Report Export deleted successfully";
    }


    // ============================================================
    // DOWNLOAD PDF / EXCEL
    // ============================================================

    @Operation(
            summary = "Download report export"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER')"
    )
    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource>
    downloadExport(
            @PathVariable Long id) {


        byte[] data =
                reportExportService
                        .downloadExport(id);


        String fileName =
                reportExportService
                        .getDownloadFileName(id);


        String contentType =
                reportExportService
                        .getContentType(id);


        ByteArrayResource resource =
                new ByteArrayResource(data);


        HttpHeaders headers =
                new HttpHeaders();


        headers.setContentType(
                MediaType.parseMediaType(
                        contentType
                )
        );


        headers.setContentDisposition(
                ContentDisposition
                        .attachment()
                        .filename(fileName)
                        .build()
        );


        headers.setContentLength(
                data.length
        );


        return ResponseEntity
                .ok()
                .headers(headers)
                .body(resource);
    }
}