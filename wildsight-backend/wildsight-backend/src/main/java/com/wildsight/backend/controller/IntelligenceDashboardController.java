package com.wildsight.backend.controller;


import com.wildsight.backend.dto.IntelligenceDashboardResponse;
import com.wildsight.backend.service.IntelligenceDashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.access.prepost.PreAuthorize;



@RestController
@RequestMapping("/api/intelligence-dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(
        name = "Intelligence Dashboard",
        description = "Unified wildlife intelligence dashboard APIs"
)
@SecurityRequirement(name = "Bearer Authentication")
public class IntelligenceDashboardController {


    private final IntelligenceDashboardService intelligenceDashboardService;



    @Operation(
            summary = "Get complete wildlife intelligence dashboard"
    )
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public IntelligenceDashboardResponse getDashboard(){

        return intelligenceDashboardService.getDashboard();

    }

}