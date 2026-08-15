package com.wildsight.backend.service;

import com.wildsight.backend.dto.SpeciesRequest;
import com.wildsight.backend.dto.SpeciesResponse;

import java.util.List;

public interface SpeciesService {

    SpeciesResponse createSpecies(SpeciesRequest request);

    List<SpeciesResponse> getAllSpecies();

    SpeciesResponse getSpeciesById(Long id);

    SpeciesResponse updateSpecies(Long id, SpeciesRequest request);

    void deleteSpecies(Long id);
}