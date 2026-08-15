package com.wildsight.backend.service;

import com.wildsight.backend.dto.BiodiversityScoreRequest;
import com.wildsight.backend.dto.BiodiversityScoreResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
import com.wildsight.backend.dto.HabitatHealthResponse;
import com.wildsight.backend.dto.SpeciesDiversityChartResponse;
import com.wildsight.backend.dto.SpeciesDiversityResponse;
import com.wildsight.backend.dto.BiodiversityDashboardResponse;
import com.wildsight.backend.dto.BiodiversityIndexResponse;
import com.wildsight.backend.dto.BiodiversityIndexResponse;
import java.util.List;
import com.wildsight.backend.dto.HabitatHealthResponse;
import com.wildsight.backend.dto.SpeciesDiversityResponse;
import com.wildsight.backend.dto.EcosystemMonitoringResponse;
public interface BiodiversityScoreService {

    BiodiversityScoreResponse createScore(BiodiversityScoreRequest request);

    List<BiodiversityScoreResponse> getAllScores();

    BiodiversityScoreResponse getScoreById(Long id);

    BiodiversityScoreResponse updateScore(
            Long id,
            BiodiversityScoreRequest request);

    void deleteScore(Long id);
    BiodiversityIndexResponse getBiodiversityIndex();
    BiodiversityDashboardResponse getDashboard();
    SpeciesDiversityResponse getSpeciesDiversityAnalysis();
    HabitatHealthResponse getHabitatHealthAssessment();
    EcosystemMonitoringResponse getEcosystemMonitoring();
    List<SpeciesDiversityChartResponse> getSpeciesDiversityChart();
    
}