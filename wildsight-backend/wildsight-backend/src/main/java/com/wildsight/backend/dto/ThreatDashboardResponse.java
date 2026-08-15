package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreatDashboardResponse {


    private Long totalLocations;

    private Long criticalAreas;

    private Long moderateRiskAreas;

    private Long lowRiskAreas;

    private String highestThreatLocation;

}