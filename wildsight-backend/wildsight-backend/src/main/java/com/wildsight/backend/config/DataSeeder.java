package com.wildsight.backend.config;


import com.wildsight.backend.entity.*;
import com.wildsight.backend.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;



@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {


    private final UserRepository userRepository;

    private final SpeciesRepository speciesRepository;

    private final SurveyRepository surveyRepository;

    private final HabitatRepository habitatRepository;

    private final PopulationEstimateRepository populationEstimateRepository;

    private final BiodiversityScoreRepository biodiversityScoreRepository;

    private final ConservationRecommendationRepository recommendationRepository;

    private final ConservationLocationRepository locationRepository;



    @Override
    public void run(String... args) {


        System.out.println(
                "========== WildSight Seeder Started =========="
        );



        User user =
                userRepository
                .findByEmail("admin@gmail.com")
                .orElse(null);



        if(user == null){

            System.out.println(
                    "Admin user not found"
            );

            return;
        }



        /*
        ======================================
        FETCH LOCATIONS
        ======================================
        */


        ConservationLocation bandipur =
                locationRepository
                .findByLocationName(
                        "Bandipur Tiger Reserve"
                )
                .orElse(null);



        ConservationLocation gir =
                locationRepository
                .findByLocationName(
                        "Gir National Park"
                )
                .orElse(null);



        if(bandipur == null || gir == null){

            System.out.println(
                    "Location missing"
            );

            return;
        }





        /*
        ======================================
        SPECIES
        ======================================
        */


        Species tiger =
                speciesRepository
                .findByCommonName(
                        "Bengal Tiger"
                )
                .orElseGet(() ->


                speciesRepository.save(

                Species.builder()

                .categoryId(1L)

                .commonName(
                        "Bengal Tiger"
                )

                .scientificName(
                        "Panthera tigris"
                )

                .conservationStatus(
                        "Endangered"
                )

                .iucnStatus(
                        "EN"
                )

                .description(
                        "Tiger species"
                )

                .build()

                ));





        Species lion =
                speciesRepository
                .findByCommonName(
                        "Asiatic Lion"
                )
                .orElseGet(() ->


                speciesRepository.save(

                Species.builder()

                .categoryId(1L)

                .commonName(
                        "Asiatic Lion"
                )

                .scientificName(
                        "Panthera leo persica"
                )

                .conservationStatus(
                        "Endangered"
                )

                .iucnStatus(
                        "EN"
                )

                .description(
                        "Lion species"
                )

                .build()

                ));






        /*
        ======================================
        SURVEYS FIRST
        ======================================
        */


        Survey tigerSurvey =
                surveyRepository.save(

                Survey.builder()

                .user(user)

                .location(bandipur)

                .surveyName(
                        "Bandipur Tiger Survey"
                )

                .description(
                        "Camera trap based tiger monitoring"
                )

                .habitatType(
                        "Forest"
                )

                .protectedArea(
                        "Bandipur Tiger Reserve"
                )

                .surveyDate(
                        LocalDate.now()
                )

                .status(
                        "Completed"
                )

                .build()

                );




        Survey lionSurvey =
                surveyRepository.save(

                Survey.builder()

                .user(user)

                .location(gir)

                .surveyName(
                        "Gir Lion Survey"
                )

                .description(
                        "Lion population monitoring"
                )

                .habitatType(
                        "Dry Forest"
                )

                .protectedArea(
                        "Gir National Park"
                )

                .surveyDate(
                        LocalDate.now()
                )

                .status(
                        "Completed"
                )

                .build()

                );






        /*
        ======================================
        HABITAT WITH SURVEY MAPPING
        ======================================
        */


        Habitat bandipurForest =

                habitatRepository.save(

                Habitat.builder()

                .habitatName(
                        "Bandipur Forest"
                )

                .habitatType(
                        "Tropical Forest"
                )

                .vegetationType(
                        "Evergreen Forest"
                )

                .description(
                        "Tiger elephant ecosystem"
                )

                .habitatQualityScore(
                        90.0
                )

                .degradationLevel(
                        15.0
                )

                .vegetationDensity(
                        85.0
                )

                .temperature(
                        24.0
                )

                .humidity(
                        80.0
                )

                .rainfall(
                        250.0
                )

                .waterQuality(
                        90.0
                )

                .airQuality(
                        95.0
                )

                .suitabilityScore(
                        92.0
                )

                .survey(
                        tigerSurvey
                )

                .build()

                );





        Habitat girForest =

                habitatRepository.save(

                Habitat.builder()

                .habitatName(
                        "Gir Forest"
                )

                .habitatType(
                        "Dry Forest"
                )

                .vegetationType(
                        "Mixed Forest"
                )

                .description(
                        "Asian lion ecosystem"
                )

                .habitatQualityScore(
                        86.0
                )

                .degradationLevel(
                        20.0
                )

                .vegetationDensity(
                        75.0
                )

                .temperature(
                        28.0
                )

                .humidity(
                        65.0
                )

                .rainfall(
                        150.0
                )

                .waterQuality(
                        85.0
                )

                .airQuality(
                        90.0
                )

                .suitabilityScore(
                        88.0
                )

                .survey(
                        lionSurvey
                )

                .build()

                );







        /*
        ======================================
        POPULATION ESTIMATION
        ======================================
        */


        populationEstimateRepository.deleteAll();



        populationEstimateRepository.save(

        PopulationEstimate.builder()

        .species(tiger)

        .survey(tigerSurvey)

        .estimatedPopulation(
                96
        )

        .density(
                new BigDecimal("8.5")
        )

        .growthRate(
                new BigDecimal("4.5")
        )

        .migrationPattern(
                "Forest Corridor Movement"
        )

        .build()

        );




        populationEstimateRepository.save(

        PopulationEstimate.builder()

        .species(lion)

        .survey(lionSurvey)

        .estimatedPopulation(
                674
        )

        .density(
                new BigDecimal("12.5")
        )

        .growthRate(
                new BigDecimal("6.2")
        )

        .migrationPattern(
                "Gir Landscape Movement"
        )

        .build()

        );






        /*
        ======================================
        BIODIVERSITY SCORE
        ======================================
        */


        System.out.println("Deleting conservation recommendations...");

recommendationRepository.deleteAll();


System.out.println("Deleting biodiversity scores...");

biodiversityScoreRepository.deleteAll();



        biodiversityScoreRepository.save(

        BiodiversityScore.builder()

        .survey(tigerSurvey)

        .habitat(bandipurForest)

        .speciesDiversityScore(
                new BigDecimal("92")
        )

        .habitatQualityScore(
                new BigDecimal("90")
        )

        .ecosystemHealthScore(
                new BigDecimal("91")
        )

        .overallScore(
                new BigDecimal("91")
        )

        .speciesCount(
                35
        )

        .healthStatus(
                "Healthy"
        )

        .build()

        );





        biodiversityScoreRepository.save(

        BiodiversityScore.builder()

        .survey(lionSurvey)

        .habitat(girForest)

        .speciesDiversityScore(
                new BigDecimal("85")
        )

        .habitatQualityScore(
                new BigDecimal("86")
        )

        .ecosystemHealthScore(
                new BigDecimal("88")
        )

        .overallScore(
                new BigDecimal("87")
        )

        .speciesCount(
                28
        )

        .healthStatus(
                "Healthy"
        )

        .build()

        );



        System.out.println(
                "========== WildSight Seeder Completed =========="
        );


    }

}