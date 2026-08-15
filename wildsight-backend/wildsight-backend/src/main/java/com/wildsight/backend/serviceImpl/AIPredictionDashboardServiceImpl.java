package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.AIPredictionDashboardResponse;
import com.wildsight.backend.entity.AIPrediction;
import com.wildsight.backend.repository.AIPredictionRepository;
import com.wildsight.backend.service.AIPredictionDashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AIPredictionDashboardServiceImpl
        implements AIPredictionDashboardService {

    private final AIPredictionRepository repository;

    @Override
    public List<AIPredictionDashboardResponse> getRecentPredictions() {

        return repository
                .findTop6ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AIPredictionDashboardResponse mapToResponse(
            AIPrediction prediction) {

        return AIPredictionDashboardResponse.builder()

                .id(prediction.getId())

                .species(prediction.getSpecies())

                .confidence(prediction.getConfidence())

                .location(prediction.getLocation())

                .researcher(prediction.getResearcher())

                .date(
                        prediction.getCreatedAt() != null
                                ? prediction.getCreatedAt().toString()
                                : ""
                )

                .build();
    }
}