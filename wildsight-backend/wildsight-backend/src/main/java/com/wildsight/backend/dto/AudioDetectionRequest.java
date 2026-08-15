package com.wildsight.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioDetectionRequest {

    @NotNull(message = "Uploaded audio is required")
    private Long audioId;

    @NotNull(message = "Species is required")
    private Long speciesId;

    @DecimalMin(value = "0.0",
            message = "Confidence cannot be less than 0")
    @DecimalMax(value = "100.0",
            message = "Confidence cannot exceed 100")
    private BigDecimal confidence;

    @Size(max = 150,
            message = "Detected call cannot exceed 150 characters")
    private String detectedCall;

    @DecimalMin(value = "0.0",
            message = "Noise level cannot be negative")
    @DecimalMax(value = "100.0",
            message = "Noise level cannot exceed 100")
    private BigDecimal noiseLevel;
}