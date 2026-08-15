package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.SpeciesRequest;
import com.wildsight.backend.dto.SpeciesResponse;
import com.wildsight.backend.entity.Species;
import com.wildsight.backend.repository.SpeciesRepository;
import com.wildsight.backend.service.SpeciesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpeciesServiceImpl implements SpeciesService {

    private final SpeciesRepository speciesRepository;

    @Override
    public SpeciesResponse createSpecies(SpeciesRequest request) {

        Species species = Species.builder()
                .categoryId(request.getCategoryId())
                .commonName(request.getCommonName())
                .scientificName(request.getScientificName())
                .conservationStatus(request.getConservationStatus())
                .iucnStatus(request.getIucnStatus())
                .description(request.getDescription())
                .build();

        species = speciesRepository.save(species);

        return mapToResponse(species);
    }

    @Override
    public List<SpeciesResponse> getAllSpecies() {

        return speciesRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SpeciesResponse getSpeciesById(Long id) {

        Species species = speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found"));

        return mapToResponse(species);
    }

    @Override
    public SpeciesResponse updateSpecies(Long id, SpeciesRequest request) {

        Species species = speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found"));

        species.setCategoryId(request.getCategoryId());
        species.setCommonName(request.getCommonName());
        species.setScientificName(request.getScientificName());
        species.setConservationStatus(request.getConservationStatus());
        species.setIucnStatus(request.getIucnStatus());
        species.setDescription(request.getDescription());

        species = speciesRepository.save(species);

        return mapToResponse(species);
    }

    @Override
    public void deleteSpecies(Long id) {

        Species species = speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found"));

        speciesRepository.delete(species);
    }

    private SpeciesResponse mapToResponse(Species species) {

        return SpeciesResponse.builder()
                .speciesId(species.getSpeciesId())
                .categoryId(species.getCategoryId())
                .commonName(species.getCommonName())
                .scientificName(species.getScientificName())
                .conservationStatus(species.getConservationStatus())
                .iucnStatus(species.getIucnStatus())
                .description(species.getDescription())
                .build();
    }
}