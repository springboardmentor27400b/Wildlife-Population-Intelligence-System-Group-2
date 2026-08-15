package com.wildsight.backend.controller;

import com.wildsight.backend.dto.analytics.CategoryDistributionResponse;
import com.wildsight.backend.dto.analytics.ConservationStatusResponse;
import com.wildsight.backend.dto.analytics.DashboardSummaryResponse;
import com.wildsight.backend.dto.analytics.SpeciesDistributionResponse;

import com.wildsight.backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public DashboardSummaryResponse dashboard() {
        return analyticsService.getDashboardSummary();
    }

    @GetMapping("/species-distribution")
    public List<SpeciesDistributionResponse> speciesDistribution() {
        return analyticsService.getSpeciesDistribution();
    }

    @GetMapping("/category-distribution")
    public List<CategoryDistributionResponse> categoryDistribution() {
        return analyticsService.getCategoryDistribution();
    }
    @GetMapping("/conservation-status")
public List<ConservationStatusResponse> conservationStatus(){

    return analyticsService.getConservationStatus();

}
}