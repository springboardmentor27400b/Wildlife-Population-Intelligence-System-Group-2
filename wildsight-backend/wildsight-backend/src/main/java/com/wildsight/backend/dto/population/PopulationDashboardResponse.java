package com.wildsight.backend.dto.population;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationDashboardResponse {

    private Long totalPopulation;

    private Long speciesRichness;

    private Double populationDensity;

    private Double growthRate;

    private Long monitoringSites;

}