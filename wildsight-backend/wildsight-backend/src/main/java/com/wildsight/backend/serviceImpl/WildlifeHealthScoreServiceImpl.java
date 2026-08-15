package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.HealthScoreResponse;
import com.wildsight.backend.repository.BiodiversityScoreRepository;
import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.PopulationEstimateRepository;
import com.wildsight.backend.repository.SpeciesRepository;
import com.wildsight.backend.service.WildlifeHealthScoreService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class WildlifeHealthScoreServiceImpl 
        implements WildlifeHealthScoreService {


    private final BiodiversityScoreRepository biodiversityRepository;

    private final PopulationEstimateRepository populationRepository;

    private final HabitatRepository habitatRepository;

    private final SpeciesRepository speciesRepository;



    @Override
    public HealthScoreResponse calculateHealthScore() {


        /*
         * 1. Species Diversity Score
         * Weight : 30%
         */

        Double biodiversityScore =
                biodiversityRepository
                        .getAverageSpeciesDiversityScore();


        if(biodiversityScore == null)
            biodiversityScore = 0.0;



        /*
         * 2. Population Stability Score
         * Weight : 25%
         */

        Double growthRate =
                populationRepository
                        .getAverageGrowthRate()
                        .doubleValue();


        Double populationStabilityScore =
                calculatePopulationStability(growthRate);



        /*
         * 3. Habitat Quality Score
         * Weight : 20%
         */

        Double habitatQuality =
                habitatRepository
                        .getAverageHabitatQualityScore();


        if(habitatQuality == null)
            habitatQuality = 0.0;



        /*
         * 4. Endangered Species Score
         * Weight : 15%
         */

        Double conservationScore =
                calculateConservationScore();



        /*
         * 5. Environmental Score
         * Weight : 10%
         */

        Double environmentScore =
                calculateEnvironmentScore();



        /*
         * FINAL ECOSYSTEM HEALTH SCORE
         *
         * Formula:
         *
         * Species Diversity        30%
         * Population Stability     25%
         * Habitat Quality          20%
         * Endangered Species       15%
         * Environment              10%
         *
         */


        Double ecosystemScore =

                (biodiversityScore * 0.30)

                +

                (populationStabilityScore * 0.25)

                +

                (habitatQuality * 0.20)

                +

                (conservationScore * 0.15)

                +

                (environmentScore * 0.10);



        String status =
                getHealthStatus(ecosystemScore);



        String recommendation =
                generateRecommendation(ecosystemScore);



        System.out.println("==============================");
        System.out.println("ECOSYSTEM SCORE : " + ecosystemScore);
        System.out.println("STATUS : " + status);
        System.out.println("RECOMMENDATION : " + recommendation);
        System.out.println("==============================");



        return HealthScoreResponse.builder()

                .speciesDiversityScore(
                        round(biodiversityScore)
                )

                .populationStabilityScore(
                        round(populationStabilityScore)
                )

                .habitatQualityScore(
                        round(habitatQuality)
                )

                .endangeredSpeciesScore(
                        round(conservationScore)
                )

                .environmentalScore(
                        round(environmentScore)
                )

                .ecosystemHealthScore(
                        round(ecosystemScore)
                )

                .conservationStatus(
                        status
                )

                .recommendation(
                        recommendation
                )

                .build();

    }





    /*
     * Population Stability Calculation
     */

    private Double calculatePopulationStability(
            Double growthRate
    ){

        if(growthRate == null)
            return 0.0;


        if(growthRate >= 80)
            return 100.0;


        if(growthRate >= 50)
            return growthRate;


        return growthRate * 0.8;

    }





    /*
     * Conservation Score Calculation
     */

    private Double calculateConservationScore(){


        long totalSpecies =
                speciesRepository.count();


        if(totalSpecies == 0)
            return 0.0;



        long endangered =
                speciesRepository
                        .countEndangeredSpecies();



        long vulnerable =
                speciesRepository
                        .countVulnerableSpecies();



        long stable =
                speciesRepository
                        .countStableSpecies();




        return
                (
                        (stable * 100.0)

                        +

                        (vulnerable * 60.0)

                        +

                        (endangered * 30.0)

                )
                /
                totalSpecies;

    }





    /*
     * Environmental Score
     */

    private Double calculateEnvironmentScore(){


        Double water =
                habitatRepository
                        .getAverageWaterQuality();



        Double air =
                habitatRepository
                        .getAverageAirQuality();



        Double humidity =
                habitatRepository
                        .getAverageHumidity();



        if(water == null)
            water = 0.0;


        if(air == null)
            air = 0.0;


        if(humidity == null)
            humidity = 0.0;



        return
                (water + air + humidity) / 3.0;

    }





    /*
     * Health Status Classification
     */

    private String getHealthStatus(
            Double score
    ){

        if(score >= 90)
            return "Excellent";


        if(score >= 75)
            return "Healthy";


        if(score >= 50)
            return "Moderate Concern";


        if(score >= 25)
            return "Vulnerable";


        return "Critical";

    }





    /*
     * Recommendation Generator
     */

    private String generateRecommendation(
            Double score
    ){

        if(score >= 90){

            return "Maintain current conservation practices and continue biodiversity monitoring.";

        }


        else if(score >= 75){

            return "Maintain routine monitoring, continue habitat conservation and periodic biodiversity assessments.";

        }


        else if(score >= 50){

            return "Increase monitoring frequency and implement preventive conservation actions.";

        }


        else if(score >= 25){

            return "Immediate habitat restoration and species protection measures required.";

        }


        else{

            return "Critical ecosystem condition. Emergency conservation intervention required.";

        }

    }





    /*
     * Round values
     */

    private Double round(
            Double value
    ){

        return Math.round(value * 100.0) / 100.0;

    }


}