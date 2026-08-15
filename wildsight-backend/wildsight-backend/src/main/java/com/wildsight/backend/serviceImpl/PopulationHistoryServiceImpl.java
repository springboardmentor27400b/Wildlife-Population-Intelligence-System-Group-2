package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.PopulationHistoryRequest;
import com.wildsight.backend.dto.PopulationHistoryResponse;
import com.wildsight.backend.entity.PopulationEstimate;
import com.wildsight.backend.entity.PopulationHistory;
import com.wildsight.backend.repository.PopulationEstimateRepository;
import com.wildsight.backend.repository.PopulationHistoryRepository;
import com.wildsight.backend.service.PopulationHistoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class PopulationHistoryServiceImpl implements PopulationHistoryService {


    private final PopulationHistoryRepository populationHistoryRepository;

    private final PopulationEstimateRepository populationEstimateRepository;



    @Override
    public PopulationHistoryResponse createHistory(
            PopulationHistoryRequest request) {


        PopulationEstimate estimate =
                populationEstimateRepository.findById(request.getEstimateId())

                .orElseThrow(() ->
                        new RuntimeException("Population Estimate not found"));


        PopulationHistory history =
                PopulationHistory.builder()

                .estimate(estimate)

                .previousPopulation(
                        request.getPreviousPopulation()
                )

                .currentPopulation(
                        request.getCurrentPopulation()
                )

                .trend(
                        request.getTrend()
                )

                .build();


        history = populationHistoryRepository.save(history);


        return mapToResponse(history);

    }



    @Override
    public List<PopulationHistoryResponse> getAllHistory() {


        return populationHistoryRepository.findAll()

                .stream()

                .map(this::mapToResponse)

                .toList();

    }




    @Override
    public PopulationHistoryResponse getHistoryById(Long id) {


        PopulationHistory history =
                populationHistoryRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("Population History not found"));


        return mapToResponse(history);

    }





    @Override
    public PopulationHistoryResponse updateHistory(
            Long id,
            PopulationHistoryRequest request) {


        PopulationHistory history =
                populationHistoryRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("Population History not found"));



        PopulationEstimate estimate =
                populationEstimateRepository.findById(request.getEstimateId())

                .orElseThrow(() ->
                        new RuntimeException("Population Estimate not found"));



        history.setEstimate(estimate);

        history.setPreviousPopulation(
                request.getPreviousPopulation()
        );

        history.setCurrentPopulation(
                request.getCurrentPopulation()
        );

        history.setTrend(
                request.getTrend()
        );



        history = populationHistoryRepository.save(history);



        return mapToResponse(history);

    }





    @Override
    public void deleteHistory(Long id) {


        PopulationHistory history =
                populationHistoryRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("Population History not found"));



        populationHistoryRepository.delete(history);

    }





    private PopulationHistoryResponse mapToResponse(
            PopulationHistory history) {



        return PopulationHistoryResponse.builder()

                .historyId(
                        history.getHistoryId()
                )


                .estimateId(
                        history.getEstimate() != null
                        ? history.getEstimate().getEstimateId()
                        : null
                )


                .speciesId(
                        history.getEstimate() != null &&
                        history.getEstimate().getSpecies() != null

                        ? history.getEstimate()
                                .getSpecies()
                                .getSpeciesId()

                        : null
                )


                .speciesName(
                        history.getEstimate() != null &&
                        history.getEstimate().getSpecies() != null

                        ? history.getEstimate()
                                .getSpecies()
                                .getCommonName()

                        : null
                )


                .previousPopulation(
                        history.getPreviousPopulation()
                )


                .currentPopulation(
                        history.getCurrentPopulation()
                )


                .trend(
                        history.getTrend()
                )


                .recordedAt(
                        history.getRecordedAt()
                )


                .build();

    }


}