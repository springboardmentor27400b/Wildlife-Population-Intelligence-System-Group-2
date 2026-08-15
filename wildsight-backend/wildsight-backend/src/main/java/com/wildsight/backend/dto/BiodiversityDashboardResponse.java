package com.wildsight.backend.dto;

import java.math.BigDecimal;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BiodiversityDashboardResponse {


    private Long totalAssessments;


    private Integer totalSpecies;


    private Double averageSpeciesDiversity;


    private Double averageHabitatQuality;


    private Double averageEcosystemHealth;


    private Double averageOverallScore;


    private Long healthyCount;


    private Long vulnerableCount;


    private Long criticalCount;

}