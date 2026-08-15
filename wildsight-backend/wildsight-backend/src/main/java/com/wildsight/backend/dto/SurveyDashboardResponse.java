package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyDashboardResponse {


    private Long totalSurveys;


    private Long activeSurveys;


    private Long completedSurveys;


    private Long pendingSurveys;


    private Long forestSurveys;


    private Long grasslandSurveys;


    private Long wetlandSurveys;


    private String dominantHabitat;


}