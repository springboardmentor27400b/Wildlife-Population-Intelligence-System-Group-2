package com.wildsight.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BiodiversityScoreRequest {

    @NotNull(message = "Survey is required")
    private Long surveyId;

    private Long habitatId;

    @DecimalMin(value = "0.0",
            message = "Species diversity score cannot be negative")
    @DecimalMax(value = "100.0",
            message = "Species diversity score cannot exceed 100")
    private BigDecimal speciesDiversityScore;

    @DecimalMin(value = "0.0",
            message = "Habitat quality score cannot be negative")
    @DecimalMax(value = "100.0",
            message = "Habitat quality score cannot exceed 100")
    private BigDecimal habitatQualityScore;

    @DecimalMin(value = "0.0",
            message = "Ecosystem health score cannot be negative")
    @DecimalMax(value = "100.0",
            message = "Ecosystem health score cannot exceed 100")
    private BigDecimal ecosystemHealthScore;

    @DecimalMin(value = "0.0",
            message = "Overall score cannot be negative")
    @DecimalMax(value = "100.0",
            message = "Overall score cannot exceed 100")
    private BigDecimal overallScore;

    @Min(value = 0,
            message = "Species count cannot be negative")
    private Integer speciesCount;

    @Size(max = 100,
            message = "Health status cannot exceed 100 characters")
    private String healthStatus;
}