package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitatSuitabilityResponse {

    private Double averageSuitabilityScore;

    private Long highlySuitableHabitats;

    private Long moderatelySuitableHabitats;

    private Long unsuitableHabitats;

    private String suitabilityStatus;

}