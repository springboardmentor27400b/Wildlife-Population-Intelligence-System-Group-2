package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.EndangeredSpeciesRequest;
import com.wildsight.backend.dto.EndangeredSpeciesResponse;
import com.wildsight.backend.entity.EndangeredSpecies;
import com.wildsight.backend.entity.Species;
import com.wildsight.backend.repository.EndangeredSpeciesRepository;
import com.wildsight.backend.repository.SpeciesRepository;
import com.wildsight.backend.service.EndangeredSpeciesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EndangeredSpeciesServiceImpl implements EndangeredSpeciesService {

    private final EndangeredSpeciesRepository endangeredSpeciesRepository;
    private final SpeciesRepository speciesRepository;

    @Override
    public EndangeredSpeciesResponse createEndangeredSpecies(EndangeredSpeciesRequest request) {

        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new RuntimeException("Species not found"));

        EndangeredSpecies endangeredSpecies = EndangeredSpecies.builder()
                .species(species)
                .riskLevel(request.getRiskLevel())
                .remarks(request.getRemarks())
                .build();

        endangeredSpecies = endangeredSpeciesRepository.save(endangeredSpecies);

        return mapToResponse(endangeredSpecies);
    }

    @Override
    public List<EndangeredSpeciesResponse> getAllEndangeredSpecies() {

        return endangeredSpeciesRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EndangeredSpeciesResponse getEndangeredSpeciesById(Long id) {

        EndangeredSpecies endangeredSpecies = endangeredSpeciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endangered Species not found"));

        return mapToResponse(endangeredSpecies);
    }

    @Override
    public EndangeredSpeciesResponse updateEndangeredSpecies(Long id,
                                                             EndangeredSpeciesRequest request) {

        EndangeredSpecies endangeredSpecies = endangeredSpeciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endangered Species not found"));

        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new RuntimeException("Species not found"));

        endangeredSpecies.setSpecies(species);
        endangeredSpecies.setRiskLevel(request.getRiskLevel());
        endangeredSpecies.setRemarks(request.getRemarks());

        endangeredSpecies = endangeredSpeciesRepository.save(endangeredSpecies);

        return mapToResponse(endangeredSpecies);
    }

    @Override
    public void deleteEndangeredSpecies(Long id) {

        EndangeredSpecies endangeredSpecies = endangeredSpeciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endangered Species not found"));

        endangeredSpeciesRepository.delete(endangeredSpecies);
    }

    private EndangeredSpeciesResponse mapToResponse(EndangeredSpecies endangeredSpecies) {

        return EndangeredSpeciesResponse.builder()
                .endangeredId(endangeredSpecies.getEndangeredId())
                .speciesId(endangeredSpecies.getSpecies().getSpeciesId())
                .speciesName(endangeredSpecies.getSpecies().getCommonName())
                .riskLevel(endangeredSpecies.getRiskLevel())
                .remarks(endangeredSpecies.getRemarks())
                .createdAt(endangeredSpecies.getCreatedAt())
                .updatedAt(endangeredSpecies.getUpdatedAt())
                .build();
    }
}