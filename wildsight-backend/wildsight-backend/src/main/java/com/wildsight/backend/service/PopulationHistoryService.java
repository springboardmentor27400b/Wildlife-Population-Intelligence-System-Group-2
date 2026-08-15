package com.wildsight.backend.service;

import com.wildsight.backend.dto.PopulationHistoryRequest;
import com.wildsight.backend.dto.PopulationHistoryResponse;

import java.util.List;

public interface PopulationHistoryService {

    PopulationHistoryResponse createHistory(
            PopulationHistoryRequest request);

    List<PopulationHistoryResponse> getAllHistory();

    PopulationHistoryResponse getHistoryById(Long id);

    PopulationHistoryResponse updateHistory(
            Long id,
            PopulationHistoryRequest request);

    void deleteHistory(Long id);
}