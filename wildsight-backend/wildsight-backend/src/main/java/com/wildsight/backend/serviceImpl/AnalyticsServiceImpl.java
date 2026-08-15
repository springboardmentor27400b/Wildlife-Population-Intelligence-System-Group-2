package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.analytics.CategoryDistributionResponse;
import com.wildsight.backend.dto.analytics.ConservationStatusResponse;
import com.wildsight.backend.dto.analytics.DashboardSummaryResponse;
import com.wildsight.backend.dto.analytics.SpeciesDistributionResponse;

import com.wildsight.backend.repository.DetectionResultRepository;
import com.wildsight.backend.repository.ObservationRepository;
import com.wildsight.backend.repository.UploadedAudioRepository;
import com.wildsight.backend.repository.UploadedImageRepository;

import com.wildsight.backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ObservationRepository observationRepository;

    private final UploadedImageRepository uploadedImageRepository;

    private final UploadedAudioRepository uploadedAudioRepository;

    private final DetectionResultRepository detectionResultRepository;

    @Override
    public DashboardSummaryResponse getDashboardSummary() {

        return DashboardSummaryResponse.builder()

                .totalObservations(
                        observationRepository.count()
                )

                .totalImages(
                        uploadedImageRepository.count()
                )

                .totalAudio(
                        uploadedAudioRepository.count()
                )

                .totalSpecies(
                        detectionResultRepository.countTotalSpecies()
                )

                .totalAnimalsDetected(
                        detectionResultRepository.count()
                )

                .endangeredSpecies(
                        detectionResultRepository.countByConservationStatus("Endangered")
                )

                .birdDetections(
                        detectionResultRepository.countByCategory("Bird")
                )

                .mammalDetections(
                        detectionResultRepository.countByCategory("Mammal")
                )

                .reptileDetections(
                        detectionResultRepository.countByCategory("Reptile")
                )

                .amphibianDetections(
                        detectionResultRepository.countByCategory("Amphibian")
                )

                .insectDetections(
                        detectionResultRepository.countByCategory("Insect")
                )

                .build();
    }

    @Override
    public List<SpeciesDistributionResponse> getSpeciesDistribution() {

        return detectionResultRepository
                .getSpeciesDistribution()
                .stream()
                .map(result -> SpeciesDistributionResponse.builder()
                        .species((String) result[0])
                        .count((Long) result[1])
                        .build())
                .toList();
    }

    @Override
    public List<CategoryDistributionResponse> getCategoryDistribution() {

        return detectionResultRepository
                .getCategoryDistribution()
                .stream()
                .map(result -> CategoryDistributionResponse.builder()
                        .category((String) result[0])
                        .count((Long) result[1])
                        .build())
                .toList();
    }

    @Override
public List<ConservationStatusResponse> getConservationStatus() {


    return detectionResultRepository
            .getConservationStatusDistribution()
            .stream()
            .map(result ->
                    ConservationStatusResponse.builder()
                            .status((String) result[0])
                            .count((Long) result[1])
                            .build()
            )
            .toList();

}
}