package com.wildsight.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationEstimateRequest {

    @NotNull(message = "Species is required")
    private Long speciesId;

    @NotNull(message = "Survey is required")
    private Long surveyId;

    @Min(value = 0,
            message = "Estimated population cannot be negative")
    private Integer estimatedPopulation;

    @DecimalMin(value = "0.0",
            message = "Density cannot be negative")
    private BigDecimal density;

    @DecimalMin(value = "-100.0",
            message = "Growth rate cannot be less than -100")
    @DecimalMax(value = "100.0",
            message = "Growth rate cannot exceed 100")
    private BigDecimal growthRate;

    @Size(max = 255,
            message = "Migration pattern cannot exceed 255 characters")
    private String migrationPattern;
}