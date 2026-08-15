package com.wildsight.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationEstimateResponse {

    private Long estimateId;

    private Long speciesId;

    private String speciesName;

    private Long surveyId;

    private String surveyName;

    private Integer estimatedPopulation;

    private BigDecimal density;

    private BigDecimal growthRate;

    private String migrationPattern;

    private LocalDateTime calculatedAt;
}