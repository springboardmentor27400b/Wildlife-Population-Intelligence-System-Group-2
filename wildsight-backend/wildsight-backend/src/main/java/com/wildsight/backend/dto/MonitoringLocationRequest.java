package com.wildsight.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringLocationRequest {

    @NotNull(message = "Survey is required")
    private Long surveyId;

    @NotBlank(message = "Location name is required")
    @Size(min = 3, max = 100,
            message = "Location name must be between 3 and 100 characters")
    private String locationName;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0",
            message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90.0",
            message = "Latitude must be less than or equal to 90")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0",
            message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180.0",
            message = "Longitude must be less than or equal to 180")
    private BigDecimal longitude;

    @Size(max = 100,
            message = "District cannot exceed 100 characters")
    private String district;

    @Size(max = 100,
            message = "State cannot exceed 100 characters")
    private String state;

    @Size(max = 100,
            message = "Country cannot exceed 100 characters")
    private String country;
}