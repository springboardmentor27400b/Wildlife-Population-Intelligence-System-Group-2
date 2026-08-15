package com.wildsight.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpeciesResponse {

    private Long speciesId;

    private Long categoryId;

    private String commonName;

    private String scientificName;

    private String conservationStatus;

    private String iucnStatus;

    private String description;
}