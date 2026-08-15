package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.*;
import com.wildsight.backend.dto.population.PopulationDashboardResponse;
import com.wildsight.backend.service.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class IntelligenceDashboardServiceImpl
        implements IntelligenceDashboardService {


    private final PopulationService populationService;

    private final BiodiversityScoreService biodiversityScoreService;

    private final HabitatService habitatService;

    private final ConservationRecommendationService conservationRecommendationService;

    private final WildlifeHealthService wildlifeHealthService;



    @Override
    public IntelligenceDashboardResponse getDashboard() {


        PopulationDashboardResponse population =
                populationService.getDashboard();



        BiodiversityDashboardResponse biodiversity =
                biodiversityScoreService.getDashboard();



        HabitatDashboardResponse habitat =
                habitatService.getDashboard();



        ConservationDashboardResponse conservation =
                conservationRecommendationService.getDashboard();



        WildlifeHealthResponse wildlifeHealth =
                wildlifeHealthService.calculateHealthScore();



        return IntelligenceDashboardResponse.builder()

                .population(population)

                .biodiversity(biodiversity)

                .habitat(habitat)

                .conservation(conservation)

                .wildlifeHealth(wildlifeHealth)

                .build();

    }

}