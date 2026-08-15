package com.wildsight.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ObservationRequest {

    @NotNull(message = "Survey is required")
    private Long surveyId;

    @NotNull(message = "Species is required")
    private Long speciesId;

    @NotNull(message = "Monitoring location is required")
    private Long locationId;

    @NotNull(message = "Monitoring device is required")
    private Long deviceId;

    @NotNull(message = "Observation time is required")
    private LocalDateTime observationTime;

    @Size(max = 1000,
            message = "Observer notes cannot exceed 1000 characters")
    private String observerNotes;

    @Size(max = 100,
            message = "Weather cannot exceed 100 characters")
    private String weather;

    @DecimalMin(value = "0.0",
            message = "Confidence score must be at least 0")
    @DecimalMax(value = "100.0",
            message = "Confidence score cannot exceed 100")
    private BigDecimal confidenceScore;

    @Min(value = 0,
            message = "Image count cannot be negative")
    private Integer imageCount;

    @Min(value = 0,
            message = "Audio count cannot be negative")
    private Integer audioCount;
}