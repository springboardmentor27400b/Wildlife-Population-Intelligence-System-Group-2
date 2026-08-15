package com.wildsight.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WildlifeHealthResponse {

    private Double speciesDiversityScore;

    private Double populationStabilityScore;

    private Double habitatQualityScore;

    private Double endangeredSpeciesScore;

    private Double environmentalScore;

    private Double ecosystemHealthScore;

    private String conservationStatus;
    
     private String recommendation;
}