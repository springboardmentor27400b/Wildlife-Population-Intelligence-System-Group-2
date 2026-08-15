package com.wildsight.backend.dto;


import lombok.*;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {


    private Long totalLocations;


    private Long totalSpecies;


    private Long totalPopulation;


    private Double averageBiodiversity;


    private Double averageHabitatQuality;


    private Double ecosystemHealth;


    private Long threatenedLocations;


}