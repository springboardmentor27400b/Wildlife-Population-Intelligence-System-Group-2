package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {


    private Long totalUsers;

    private Long totalSurveys;

    private Long totalSpecies;

    private Long totalLocations;

    private Long totalPopulation;

}