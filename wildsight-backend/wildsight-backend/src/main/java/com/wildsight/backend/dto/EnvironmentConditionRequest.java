package com.wildsight.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentConditionRequest {

    @NotNull(message = "Habitat is required")
    private Long habitatId;

    @NotNull(message = "Survey is required")
    private Long surveyId;

    @DecimalMin(value = "-30.0",
            message = "Temperature cannot be below -30°C")
    @DecimalMax(value = "70.0",
            message = "Temperature cannot exceed 70°C")
    private BigDecimal temperature;

    @DecimalMin(value = "0.0",
            message = "Humidity cannot be negative")
    @DecimalMax(value = "100.0",
            message = "Humidity cannot exceed 100%")
    private BigDecimal humidity;

    @DecimalMin(value = "0.0",
            message = "Rainfall cannot be negative")
    private BigDecimal rainfall;

    @Size(max = 100,
            message = "Air quality cannot exceed 100 characters")
    private String airQuality;

    @DecimalMin(value = "0.0",
            message = "Wind speed cannot be negative")
    private BigDecimal windSpeed;

    @Size(max = 100,
            message = "Weather condition cannot exceed 100 characters")
    private String weatherCondition;

    @NotNull(message = "Recorded time is required")
    private LocalDateTime recordedAt;
}