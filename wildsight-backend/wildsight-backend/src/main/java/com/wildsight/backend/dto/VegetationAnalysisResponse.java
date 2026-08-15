package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VegetationAnalysisResponse {

    private Double averageVegetationDensity;

    private String dominantVegetationType;

    private String vegetationStatus;

}