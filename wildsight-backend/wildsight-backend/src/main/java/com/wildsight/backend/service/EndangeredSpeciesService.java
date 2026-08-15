package com.wildsight.backend.service;

import com.wildsight.backend.dto.EndangeredSpeciesRequest;
import com.wildsight.backend.dto.EndangeredSpeciesResponse;

import java.util.List;

public interface EndangeredSpeciesService {

    EndangeredSpeciesResponse createEndangeredSpecies(
            EndangeredSpeciesRequest request);

    List<EndangeredSpeciesResponse> getAllEndangeredSpecies();

    EndangeredSpeciesResponse getEndangeredSpeciesById(Long id);

    EndangeredSpeciesResponse updateEndangeredSpecies(
            Long id,
            EndangeredSpeciesRequest request);

    void deleteEndangeredSpecies(Long id);
}