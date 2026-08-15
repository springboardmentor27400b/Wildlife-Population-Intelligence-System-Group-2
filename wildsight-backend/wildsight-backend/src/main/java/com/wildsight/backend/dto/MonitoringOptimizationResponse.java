package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringOptimizationResponse {

    private Integer recommendedSurveyFrequency;

    private String monitoringLevel;

    private String cameraTrapRecommendation;

    private String droneMonitoring;

    private String aiRecommendation;

}