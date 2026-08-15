package com.wildsight.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentConditionResponse {

    private Long conditionId;

    private Long habitatId;
    private String habitatName;

    private Long surveyId;

    private BigDecimal temperature;

    private BigDecimal humidity;

    private BigDecimal rainfall;

    private String airQuality;

    private BigDecimal windSpeed;

    private String weatherCondition;

    private LocalDateTime recordedAt;
}