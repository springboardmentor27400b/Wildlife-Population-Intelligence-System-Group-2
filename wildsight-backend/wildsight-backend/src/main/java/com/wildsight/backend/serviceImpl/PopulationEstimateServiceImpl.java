package com.wildsight.backend.serviceImpl;


import com.wildsight.backend.dto.PopulationEstimateRequest;
import com.wildsight.backend.dto.PopulationEstimateResponse;

import com.wildsight.backend.entity.PopulationEstimate;
import com.wildsight.backend.entity.Species;
import com.wildsight.backend.entity.Survey;

import com.wildsight.backend.repository.PopulationEstimateRepository;
import com.wildsight.backend.repository.SpeciesRepository;
import com.wildsight.backend.repository.SurveyRepository;

import com.wildsight.backend.service.PopulationEstimateService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;



@Service
@RequiredArgsConstructor
public class PopulationEstimateServiceImpl
        implements PopulationEstimateService {



    private final PopulationEstimateRepository populationEstimateRepository;

    private final SpeciesRepository speciesRepository;

    private final SurveyRepository surveyRepository;




    @Override
    public PopulationEstimateResponse createEstimate(
            PopulationEstimateRequest request) {



        Species species =
                speciesRepository.findById(request.getSpeciesId())

                .orElseThrow(() ->
                        new RuntimeException("Species not found"));



        Survey survey =
                surveyRepository.findById(request.getSurveyId())

                .orElseThrow(() ->
                        new RuntimeException("Survey not found"));



        PopulationEstimate estimate =
                PopulationEstimate.builder()

                .species(species)

                .survey(survey)

                .estimatedPopulation(
                        request.getEstimatedPopulation()
                )

                .density(
                        request.getDensity()
                )

                .growthRate(
                        request.getGrowthRate()
                )

                .migrationPattern(
                        request.getMigrationPattern()
                )

                .build();



        estimate =
                populationEstimateRepository.save(estimate);



        return mapToResponse(estimate);

    }





    @Override
    public List<PopulationEstimateResponse> getAllEstimates() {


        return populationEstimateRepository.findAll()

                .stream()

                .map(this::mapToResponse)

                .toList();

    }






    @Override
    public PopulationEstimateResponse getEstimateById(Long id) {



        PopulationEstimate estimate =
                populationEstimateRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("Population Estimate not found"));



        return mapToResponse(estimate);

    }







    @Override
    public PopulationEstimateResponse updateEstimate(
            Long id,
            PopulationEstimateRequest request) {



        PopulationEstimate estimate =
                populationEstimateRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("Population Estimate not found"));



        Species species =
                speciesRepository.findById(request.getSpeciesId())

                .orElseThrow(() ->
                        new RuntimeException("Species not found"));



        Survey survey =
                surveyRepository.findById(request.getSurveyId())

                .orElseThrow(() ->
                        new RuntimeException("Survey not found"));



        estimate.setSpecies(species);

        estimate.setSurvey(survey);

        estimate.setEstimatedPopulation(
                request.getEstimatedPopulation()
        );

        estimate.setDensity(
                request.getDensity()
        );

        estimate.setGrowthRate(
                request.getGrowthRate()
        );

        estimate.setMigrationPattern(
                request.getMigrationPattern()
        );



        estimate =
                populationEstimateRepository.save(estimate);



        return mapToResponse(estimate);

    }







    @Override
    public void deleteEstimate(Long id) {



        PopulationEstimate estimate =
                populationEstimateRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("Population Estimate not found"));



        populationEstimateRepository.delete(estimate);

    }








    private PopulationEstimateResponse mapToResponse(
            PopulationEstimate estimate) {



        return PopulationEstimateResponse.builder()


                .estimateId(
                        estimate.getEstimateId()
                )


                .speciesId(
                        estimate.getSpecies() != null

                        ? estimate.getSpecies()
                                .getSpeciesId()

                        : null
                )


                .speciesName(
                        estimate.getSpecies() != null

                        ? estimate.getSpecies()
                                .getCommonName()

                        : null
                )


                .surveyId(
                        estimate.getSurvey() != null

                        ? estimate.getSurvey()
                                .getSurveyId()

                        : null
                )


                .surveyName(
                        estimate.getSurvey() != null

                        ? estimate.getSurvey()
                                .getSurveyName()

                        : null
                )


                .estimatedPopulation(
                        estimate.getEstimatedPopulation()
                )


                .density(
                        estimate.getDensity()
                )


                .growthRate(
                        estimate.getGrowthRate()
                )


                .migrationPattern(
                        estimate.getMigrationPattern()
                )


                .calculatedAt(
                        estimate.getCalculatedAt()
                )


                .build();

    }


}