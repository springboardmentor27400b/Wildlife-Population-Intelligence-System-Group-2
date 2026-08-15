package com.wildsight.backend.serviceImpl;


import com.wildsight.backend.dto.LocationIntelligenceResponse;
import com.wildsight.backend.entity.ConservationLocation;

import com.wildsight.backend.repository.*;

import com.wildsight.backend.service.LocationIntelligenceService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class LocationIntelligenceServiceImpl
        implements LocationIntelligenceService {


    private final ConservationLocationRepository locationRepository;

    private final PopulationEstimateRepository populationRepository;

    private final BiodiversityScoreRepository biodiversityRepository;

    private final HabitatRepository habitatRepository;



    @Override
    public LocationIntelligenceResponse getLocationDetails(Long id) {


        ConservationLocation location =
                locationRepository.findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Location not found"
                    )
                );



        /*
         ==================================
          POPULATION INTELLIGENCE
         ==================================
        */


        Long population =
                populationRepository
                .getPopulationByLocation(id);


        if(population == null)
            population = 0L;



        Long speciesCount =
                populationRepository
                .getSpeciesCountByLocation(id);


        if(speciesCount == null)
            speciesCount = 0L;




        /*
         ==================================
          BIODIVERSITY INTELLIGENCE
         ==================================
        */


        Double biodiversityScore =
                biodiversityRepository
                .getBiodiversityByLocation(id);


        if(biodiversityScore == null)
            biodiversityScore = 0.0;




        /*
         ==================================
          HABITAT INTELLIGENCE
         ==================================
        */


        Double habitatScore =
                habitatRepository
                .getHabitatQualityByLocation(id);


        if(habitatScore == null)
            habitatScore = 0.0;



        /*
         ==================================
          ENVIRONMENT INTELLIGENCE
         ==================================
        */

        Double water =
                habitatRepository
                .getWaterQualityByLocation(id);


        Double vegetation =
                habitatRepository
                .getVegetationDensityByLocation(id);



        if(water == null)
            water = 0.0;


        if(vegetation == null)
            vegetation = 0.0;



        Double environmentScore =
                (water + vegetation) / 2;




        /*
         ==================================
          POPULATION STABILITY
         ==================================
        */


        Double populationScore =
                calculatePopulationScore(
                    population
                );



        /*
         ==================================
          CONSERVATION SCORE
         ==================================
        */


        Double conservationScore =
                calculateConservationScore(
                    speciesCount
                );





        /*
         ==================================
          FINAL HEALTH SCORE
          
          Biodiversity       30%
          Population         25%
          Habitat            20%
          Conservation       15%
          Environment        10%

         ==================================
        */


        Double ecosystemHealth =

                (biodiversityScore * 0.30)

                +

                (populationScore * 0.25)

                +

                (habitatScore * 0.20)

                +

                (conservationScore * 0.15)

                +

                (environmentScore * 0.10);



        ecosystemHealth =
                round(ecosystemHealth);



        String status =
                getStatus(
                    ecosystemHealth
                );



        String threatLevel;


        if(ecosystemHealth >= 75)

            threatLevel = "LOW";


        else if(ecosystemHealth >= 50)

            threatLevel = "MODERATE";


        else

            threatLevel = "HIGH";





        String recommendation;


        if(ecosystemHealth >= 85)

        {

            recommendation =
            "Ecosystem is stable. Continue regular monitoring and biodiversity protection.";

        }


        else if(ecosystemHealth >= 70)

        {

            recommendation =
            "Increase monitoring frequency and perform preventive conservation actions.";

        }


        else if(ecosystemHealth >= 50)

        {

            recommendation =
            "Habitat restoration and species protection measures required.";

        }


        else

        {

            recommendation =
            "Critical ecosystem condition. Immediate conservation intervention required.";

        }





        return LocationIntelligenceResponse.builder()


                .id(location.getLocationId())

                .name(location.getLocationName())

                .state(location.getState())

                .type(location.getLocationType())


                .latitude(location.getLatitude())

                .longitude(location.getLongitude())


                .population(population)

                .speciesCount(speciesCount)



                .biodiversityScore(
                        round(biodiversityScore)
                )


                .habitatScore(
                        round(habitatScore)
                )


                .healthScore(
                        ecosystemHealth
                )


                .conservationStatus(
                        status
                )


                .threatLevel(
                        threatLevel
                )


                .recommendation(
                        recommendation
                )


                .build();

    }






    private Double calculatePopulationScore(Long population)
    {


        if(population >= 1000)

            return 100.0;


        if(population >= 500)

            return 85.0;


        if(population >= 100)

            return 70.0;


        if(population >= 50)

            return 50.0;


        return 30.0;

    }





    private Double calculateConservationScore(Long species)
    {


        if(species >= 20)

            return 100.0;


        if(species >= 10)

            return 80.0;


        if(species >= 5)

            return 60.0;


        if(species >= 2)

            return 50.0;


        return 30.0;

    }





    private String getStatus(Double score)
    {


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





    private Double round(Double value)
    {

        return Math.round(value * 100.0) / 100.0;

    }


}