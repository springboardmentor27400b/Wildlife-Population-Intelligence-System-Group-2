package com.wildsight.backend.service;

import com.wildsight.backend.dto.ConservationDashboardResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
import com.wildsight.backend.dto.ConservationRecommendationRequest;
import com.wildsight.backend.dto.ConservationRecommendationResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
import java.util.List;
import com.wildsight.backend.dto.HabitatRestorationResponse;
import com.wildsight.backend.dto.MonitoringOptimizationResponse;
import com.wildsight.backend.dto.ProtectionStrategyResponse;
import com.wildsight.backend.dto.MonitoringOptimizationResponse;
import com.wildsight.backend.dto.ResourceAllocationResponse;
import com.wildsight.backend.dto.ConservationDashboardResponse;
public interface ConservationRecommendationService {

    ConservationRecommendationResponse createRecommendation(
            ConservationRecommendationRequest request);

    List<ConservationRecommendationResponse> getAllRecommendations();

    ConservationRecommendationResponse getRecommendationById(Long id);

    ConservationRecommendationResponse updateRecommendation(
            Long id,
            ConservationRecommendationRequest request);

    void deleteRecommendation(Long id);

    ConservationPriorityResponse getConservationPriority();
    HabitatRestorationResponse getHabitatRestoration();
    ProtectionStrategyResponse getProtectionStrategy();
    MonitoringOptimizationResponse getMonitoringOptimization();
    ResourceAllocationResponse getResourceAllocation();
    ConservationDashboardResponse getDashboard();
}