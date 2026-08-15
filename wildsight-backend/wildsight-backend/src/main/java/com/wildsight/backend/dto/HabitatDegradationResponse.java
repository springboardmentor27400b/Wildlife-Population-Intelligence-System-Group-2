package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitatDegradationResponse {

    private Double averageDegradationLevel;

    private Long lowRiskHabitats;

    private Long moderateRiskHabitats;

    private Long highRiskHabitats;

    private Long criticalHabitats;

    private String overallStatus;

}