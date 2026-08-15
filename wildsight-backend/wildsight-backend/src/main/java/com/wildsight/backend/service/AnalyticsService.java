package com.wildsight.backend.service;

import com.wildsight.backend.dto.analytics.CategoryDistributionResponse;
import com.wildsight.backend.dto.analytics.ConservationStatusResponse;
import com.wildsight.backend.dto.analytics.DashboardSummaryResponse;
import com.wildsight.backend.dto.analytics.SpeciesDistributionResponse;

import java.util.List;

public interface AnalyticsService {

    DashboardSummaryResponse getDashboardSummary();

    List<SpeciesDistributionResponse> getSpeciesDistribution();

    List<CategoryDistributionResponse> getCategoryDistribution();

    List<ConservationStatusResponse> getConservationStatus();

}