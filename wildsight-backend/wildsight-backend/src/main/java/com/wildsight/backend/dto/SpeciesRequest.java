package com.wildsight.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SpeciesRequest {

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Common name is required")
    @Size(min = 3, max = 100,
            message = "Common name must be between 3 and 100 characters")
    private String commonName;

    @NotBlank(message = "Scientific name is required")
    @Size(min = 3, max = 150,
            message = "Scientific name must be between 3 and 150 characters")
    private String scientificName;

    @NotBlank(message = "Conservation status is required")
    @Size(max = 50,
            message = "Conservation status cannot exceed 50 characters")
    private String conservationStatus;

    @NotBlank(message = "IUCN status is required")
    @Size(max = 50,
            message = "IUCN status cannot exceed 50 characters")
    private String iucnStatus;

    @Size(max = 1000,
            message = "Description cannot exceed 1000 characters")
    private String description;
}