package com.wildsight.backend.serviceImpl;


import com.wildsight.backend.dto.WildlifeHealthDashboardResponse;
import com.wildsight.backend.dto.WildlifeHealthResponse;
import com.wildsight.backend.repository.BiodiversityScoreRepository;
import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.PopulationHistoryRepository;
import com.wildsight.backend.service.WildlifeHealthService;
import com.wildsight.backend.entity.PopulationTrend;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class WildlifeHealthServiceImpl implements WildlifeHealthService {


    private final BiodiversityScoreRepository biodiversityScoreRepository;

    private final HabitatRepository habitatRepository;

    private final PopulationHistoryRepository populationHistoryRepository;



    @Override
    public WildlifeHealthResponse calculateHealthScore() {


        double biodiversity = 0;

        double habitat = 0;

        double population = 0;

        double endangered = 70;

        double environment = 70;



        if(biodiversityScoreRepository
                .getAverageOverallScore() != null){

            biodiversity =
                    biodiversityScoreRepository
                    .getAverageOverallScore()
                    .doubleValue();

        }



        if(habitatRepository
                .getAverageHabitatQualityScore()!=null){

            habitat =
                    habitatRepository
                    .getAverageHabitatQualityScore();

        }



        /*
         Population stability calculation
         will use population history trends
        */

       long increasing =
        populationHistoryRepository
                .countByTrend(PopulationTrend.INCREASING);


long decreasing =
        populationHistoryRepository
                .countByTrend(PopulationTrend.DECLINING);



        if(increasing + decreasing > 0){

            population =
                    ((double) increasing /
                    (increasing + decreasing))
                    *100;

        }
        else{

            population = 50;

        }



        double ecosystemScore =

                (biodiversity * 0.30)

                +

                (population * 0.25)

                +

                (habitat * 0.20)

                +

                (endangered * 0.15)

                +

                (environment * 0.10);



        String status;


        if(ecosystemScore >=90)
            status="Excellent";

        else if(ecosystemScore >=75)
            status="Healthy";

        else if(ecosystemScore >=50)
            status="Moderate Concern";

        else if(ecosystemScore >=25)
            status="Vulnerable";

        else
            status="Critical";



        return WildlifeHealthResponse.builder()

                .speciesDiversityScore(
                        round(biodiversity))

                .populationStabilityScore(
                        round(population))

                .habitatQualityScore(
                        round(habitat))

                .endangeredSpeciesScore(
                        endangered)

                .environmentalScore(
                        environment)

                .ecosystemHealthScore(
                        round(ecosystemScore))

                .conservationStatus(status)

                .build();

    }



    private double round(double value){

        return Math.round(value*100.0)/100.0;

    }



    @Override
    public WildlifeHealthDashboardResponse getDashboard(){


        WildlifeHealthResponse response =
                calculateHealthScore();


        return WildlifeHealthDashboardResponse.builder()

                .healthScore(response)

                .overallMessage(
                        "AI generated ecosystem health assessment")

                .recommendation(
                        "Continue biodiversity monitoring and conservation activities")

                .build();

    }

}