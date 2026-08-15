package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitatDashboardResponse {

    private Long totalHabitats;

    private Double averageHabitatQuality;

    private Double averageSuitability;

    private Long healthyHabitats;

    private Long degradedHabitats;

    private Long criticalHabitats;

}