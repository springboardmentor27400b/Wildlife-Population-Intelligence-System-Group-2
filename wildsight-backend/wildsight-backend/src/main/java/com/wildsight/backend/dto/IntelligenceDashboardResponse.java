package com.wildsight.backend.dto;

import com.wildsight.backend.dto.population.PopulationDashboardResponse;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntelligenceDashboardResponse {


    private PopulationDashboardResponse population;


    private BiodiversityDashboardResponse biodiversity;


    private HabitatDashboardResponse habitat;


    private ConservationDashboardResponse conservation;


    private WildlifeHealthResponse wildlifeHealth;


}