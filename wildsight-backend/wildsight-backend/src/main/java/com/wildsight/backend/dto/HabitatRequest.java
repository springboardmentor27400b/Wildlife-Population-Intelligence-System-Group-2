package com.wildsight.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitatRequest {

    @NotBlank(message = "Habitat name is required")
    @Size(min = 3, max = 150,
            message = "Habitat name must be between 3 and 150 characters")
    private String habitatName;

    @Size(max = 100,
            message = "Habitat type cannot exceed 100 characters")
    private String habitatType;

    @Size(max = 100,
            message = "Vegetation type cannot exceed 100 characters")
    private String vegetationType;

    @Size(max = 1000,
            message = "Description cannot exceed 1000 characters")
    private String description;
}