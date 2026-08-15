package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConservationPriorityResponse {

    private Double biodiversityScore;

    private Double averageGrowthRate;

    private Long increasingSpecies;

    private Long stableSpecies;

    private Long decreasingSpecies;

    private String conservationPriority;

    private String reason;

    private String recommendedAction;

}