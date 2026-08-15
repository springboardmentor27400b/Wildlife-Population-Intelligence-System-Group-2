package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProtectionStrategyResponse {

    private Double biodiversityScore;

    private Double habitatQuality;

    private Double averageGrowthRate;

    private String protectionLevel;

    private String strategy;

    private String expectedImpact;

}