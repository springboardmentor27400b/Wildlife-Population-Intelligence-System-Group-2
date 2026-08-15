package com.wildsight.backend.dto;

import com.wildsight.backend.entity.PopulationTrend;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationHistoryRequest {

    @NotNull(message = "Population estimate is required")
    private Long estimateId;

    @Min(value = 0,
            message = "Previous population cannot be negative")
    private Integer previousPopulation;

    @Min(value = 0,
            message = "Current population cannot be negative")
    private Integer currentPopulation;

    @NotNull(message = "Population trend is required")
    private PopulationTrend trend;
}