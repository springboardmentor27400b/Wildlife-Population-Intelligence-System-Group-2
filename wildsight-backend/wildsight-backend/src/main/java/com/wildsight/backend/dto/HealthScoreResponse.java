package com.wildsight.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthScoreResponse {


    private Double speciesDiversityScore;


    private Double populationStabilityScore;


    private Double habitatQualityScore;


    private Double endangeredSpeciesScore;


    private Double environmentalScore;


    private Double ecosystemHealthScore;


    private String conservationStatus;


    private String recommendation;


    public String getRecommendation() {
        return recommendation;
    }


    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

}