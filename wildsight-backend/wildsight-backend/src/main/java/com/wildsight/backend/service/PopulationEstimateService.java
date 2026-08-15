package com.wildsight.backend.service;

import com.wildsight.backend.dto.PopulationEstimateRequest;
import com.wildsight.backend.dto.PopulationEstimateResponse;

import java.util.List;

public interface PopulationEstimateService {

    PopulationEstimateResponse createEstimate(
            PopulationEstimateRequest request);

    List<PopulationEstimateResponse> getAllEstimates();

    PopulationEstimateResponse getEstimateById(Long id);

    PopulationEstimateResponse updateEstimate(
            Long id,
            PopulationEstimateRequest request);

    void deleteEstimate(Long id);
}