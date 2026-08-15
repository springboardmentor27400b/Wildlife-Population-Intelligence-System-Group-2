package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitatRestorationResponse {

    private Double averageHabitatQuality;

    private Long totalHabitats;

    private String restorationPriority;

    private String restorationRecommendation;

    private String expectedOutcome;

}