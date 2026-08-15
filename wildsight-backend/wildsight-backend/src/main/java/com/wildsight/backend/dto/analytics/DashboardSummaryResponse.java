package com.wildsight.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalObservations;

    private long totalImages;

    private long totalAudio;

    private long totalSpecies;

    private long totalAnimalsDetected;

    private long endangeredSpecies;

    private long birdDetections;

    private long mammalDetections;

    private long reptileDetections;

    private long amphibianDetections;

    private long insectDetections;
}