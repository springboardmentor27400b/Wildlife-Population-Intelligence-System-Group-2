package com.wildsight.backend.service;

import com.wildsight.backend.dto.EnvironmentalMonitoringResponse;
import com.wildsight.backend.dto.HabitatClassificationResponse;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import com.wildsight.backend.dto.HabitatDegradationResponse;
import com.wildsight.backend.dto.HabitatRequest;
import com.wildsight.backend.dto.HabitatResponse;
import com.wildsight.backend.dto.HabitatSuitabilityResponse;
import com.wildsight.backend.dto.VegetationAnalysisResponse;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import com.wildsight.backend.dto.HabitatSuitabilityResponse;
import java.util.List;
import com.wildsight.backend.dto.HabitatDegradationResponse;
public interface HabitatService {

    HabitatResponse createHabitat(HabitatRequest request);

    List<HabitatResponse> getAllHabitats();

    HabitatResponse getHabitatById(Long id);

    HabitatResponse updateHabitat(Long id,
                                  HabitatRequest request);

    void deleteHabitat(Long id);

    HabitatDashboardResponse getDashboard();
    HabitatClassificationResponse getHabitatClassification();
    HabitatDegradationResponse getHabitatDegradation();
    VegetationAnalysisResponse getVegetationAnalysis();
    EnvironmentalMonitoringResponse getEnvironmentalMonitoring();
    HabitatSuitabilityResponse getHabitatSuitability();
}