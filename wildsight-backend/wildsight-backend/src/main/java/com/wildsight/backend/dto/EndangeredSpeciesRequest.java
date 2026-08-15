package com.wildsight.backend.dto;

import com.wildsight.backend.entity.RiskLevel;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EndangeredSpeciesRequest {

    @NotNull(message = "Species is required")
    private Long speciesId;

    @NotNull(message = "Risk level is required")
    private RiskLevel riskLevel;

    @Size(max = 1000,
            message = "Remarks cannot exceed 1000 characters")
    private String remarks;
}